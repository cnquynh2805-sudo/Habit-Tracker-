module.exports = {
  root: true,
  extends: [
    'universe/native',
    'plugin:react-native-a11y/all',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react-native-a11y', 'react-native'],
  rules: {
    'react-native/no-inline-styles': 'error',
    'react-native/no-color-literals': 'error',
    'react-native-a11y/has-accessibility-hint': 'off', // Opt-out if too noisy, but enforce basic a11y
  },
};
