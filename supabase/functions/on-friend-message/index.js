// Supabase Edge Function: on-friend-message
// friend_notes INSERT sonrası tetiklenir (DB webhook veya pg_net trigger).
//
// Deploy:
//   supabase functions deploy on-friend-message --no-verify-jwt
//
// Secrets (Dashboard > Edge Functions > Secrets):
//   FIREBASE_SERVICE_ACCOUNT — send-push-notification ile aynı
//   WEBHOOK_SECRET — DB trigger / webhook doğrulama (rastgele güçlü string)
//
// Supabase Dashboard > Database > Webhooks:
//   Table: badoo.friend_notes | Event: INSERT
//   URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/on-friend-message
//   Header: X-Webhook-Secret = WEBHOOK_SECRET değeri
//
// runtime_config (pg_net trigger):
//   friend_message_webhook_url = https://REF.supabase.co/functions/v1/on-friend-message
//   webhook_secret = Edge Function WEBHOOK_SECRET ile aynı
//   service_role_key = Project Settings > API > service_role (pg_net auth için önerilir)
// YANLIŞ URL: .../on-friend-message/on-friend-message

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

function getSenderDisplayName(profile) {
  if (profile?.nickname?.trim()) {
    return profile.nickname.trim();
  }
  return 'Arkadaşın';
}

function truncateMessage(message, max = 120) {
  const text = (message || '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function isAuthorized(req) {
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
  const headerSecret = req.headers.get('X-Webhook-Secret');

  if (webhookSecret && headerSecret === webhookSecret) {
    return true;
  }

  const authHeader = req.headers.get('Authorization') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (serviceKey && authHeader === `Bearer ${serviceKey}`) {
    return true;
  }

  return false;
}

async function sendPushToUser({ userId, title, body, data }) {
  const baseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(`${baseUrl}/functions/v1/send-push-notification`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, title, body, data }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`push invoke failed: ${response.status} ${text}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const record = payload.record || payload;

    const noteId = record?.id;
    const senderId = record?.sender_id;
    const receiverId = record?.receiver_id;
    const message = record?.message;
    const parentNoteId = record?.parent_note_id;

    if (!noteId || !senderId || !receiverId || !message) {
      return new Response(JSON.stringify({ error: 'Geçersiz kayıt' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { db: { schema: 'badoo' } },
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('user_id', senderId)
      .maybeSingle();

    const senderName = getSenderDisplayName(profile);
    const preview = truncateMessage(message);
    const notificationType = parentNoteId ? 'note_reply' : 'friend_message';
    const title = parentNoteId ? 'Notuna cevap geldi' : 'Yeni mesajın var';
    const body = `${senderName}: ${preview}`;
    const route = `/friends/chat/${senderId}`;

    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: receiverId,
      sender_id: senderId,
      type: notificationType,
      title,
      body,
      payload: { route, noteId, senderId },
    });

    if (notificationError) {
      throw notificationError;
    }

    const pushResult = await sendPushToUser({
      userId: receiverId,
      title: senderName,
      body: preview,
      data: {
        type: notificationType,
        route,
        noteId,
        senderId,
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        receiverId,
        push: pushResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
