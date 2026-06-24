// Supabase Edge Function: send-push-notification
// Deploy: supabase functions deploy send-push-notification
//
// Secret (Supabase Dashboard > Edge Functions > Secrets):
//   FIREBASE_SERVICE_ACCOUNT = Firebase service account JSON (tek satır)
//
// JSON dosyasını ASLA repoya ekleme. Sadece Supabase secret olarak sakla.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { JWT } from 'npm:google-auth-library@9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getServiceAccount() {
  const raw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getFcmAccessToken(serviceAccount) {
  const client = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });

  const credentials = await client.authorize();
  return credentials.access_token;
}

async function sendFcmMessage({ accessToken, projectId, token, title, body, data }) {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title,
            body: body || title,
          },
          data: Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, String(value ?? '')]),
          ),
        },
      }),
    },
  );

  return response.ok;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, title, body, data = {} } = await req.json();

    if (!userId || !title) {
      return new Response(JSON.stringify({ error: 'userId ve title gerekli' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceAccount = getServiceAccount();
    if (!serviceAccount?.project_id || !serviceAccount?.private_key) {
      return new Response(JSON.stringify({ sent: 0, reason: 'missing_service_account' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { db: { schema: 'badoo' } },
    );

    const { data: tokens, error } = await supabase
      .from('device_push_tokens')
      .select('fcm_token')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_tokens' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await getFcmAccessToken(serviceAccount);
    let sent = 0;

    for (const row of tokens) {
      const ok = await sendFcmMessage({
        accessToken,
        projectId: serviceAccount.project_id,
        token: row.fcm_token,
        title,
        body,
        data,
      });

      if (ok) {
        sent += 1;
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
