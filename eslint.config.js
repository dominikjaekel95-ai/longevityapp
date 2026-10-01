// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'supabase/functions/**', 'coverage/*'],
  },
  {
    rules: {
      // Alle nutzerseitigen Texte kommen aus src/i18n und src/content; Konsolen-Ausgaben bleiben erlaubt (Sync-Log).
      'no-console': 'off',
    },
  },
]);
