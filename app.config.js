const appJson = require('./app.json');

module.exports = () => ({
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      googleServicesFile: './GoogleService-Info.plist',
      entitlements: {
        'aps-environment': process.env.EAS_BUILD_PROFILE === 'production' ? 'production' : 'development',
        'com.apple.security.application-groups': ['group.com.omerexpo.badoo'],
      },
      infoPlist: {
        ...appJson.expo.ios?.infoPlist,
        UIBackgroundModes: ['remote-notification'],
      },
    },
    plugins: [
      ...(appJson.expo.plugins || []),
      '@bacons/apple-targets',
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            forceStaticLinking: ['RNFBApp', 'RNFBMessaging'],
          },
        },
      ],
    ],
    extra: {
      ...appJson.expo.extra,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_ANON_KEY ||
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.EXPO_PUBLIC_SUPABASE_KEY,
      openAiApiKey: process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
  },
});
