import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * App-Konfiguration (ersetzt app.json). Keine Geheimnisse hier: alles, was hier steht, landet im Build.
 * Umgebungsvariablen: .env.example dokumentiert sie, echte Werte liegen nur in EAS Secrets.
 *
 * Name und Paketname sind Arbeitstitel (offene Entscheidung 1 im Brief). Der Android-Paketname lässt sich bis
 * zum ersten Upload in die Play Console frei ändern, danach nie wieder.
 */
const APP_NAME = process.env.APP_NAME ?? 'Longvy';
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE ?? 'de.nachderspritze.longvy';
const IOS_BUNDLE_ID = process.env.IOS_BUNDLE_ID ?? ANDROID_PACKAGE;

const cameraText =
  'Die Kamera wird nur für dein wöchentliches Verlaufsfoto verwendet. Das Foto bleibt auf deinem Gerät und in deinem Konto.';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: 'longvy-app',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'longvy',
  userInterfaceStyle: 'automatic',
  ios: {
    // Konfiguriert, aber nicht gebaut (Phase 3).
    bundleIdentifier: IOS_BUNDLE_ID,
    supportsTablet: false,
    infoPlist: {
      NSCameraUsageDescription: cameraText,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: ANDROID_PACKAGE,
    adaptiveIcon: {
      backgroundColor: '#f5f4f1',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: ['android.permission.CAMERA', 'android.permission.POST_NOTIFICATIONS'],
    // Kein ACCESS_FINE_LOCATION, kein READ_MEDIA_IMAGES: die App liest keine Galerie, nur die eigene Kamera.
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
    ],
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#f5f4f1',
        image: './assets/images/splash-icon.png',
        imageWidth: 96,
        dark: { backgroundColor: '#1b171c' },
      },
    ],
    ['expo-camera', { cameraPermission: cameraText, recordAudioAndroid: false }],
    [
      'expo-notifications',
      {
        // Eine Erinnerung pro Woche, lokal geplant. Kein Push-Server.
        color: '#5c2d5e',
        defaultChannel: 'erinnerung',
      },
    ],
    'expo-sqlite',
    'expo-localization',
    'expo-image',
    'expo-sharing',
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      // Wird von `eas init` gesetzt bzw. über EAS_PROJECT_ID gelesen; keine Geheimnis, aber kontospezifisch.
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
  owner: process.env.EXPO_OWNER,
});
