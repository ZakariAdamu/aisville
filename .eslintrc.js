module.exports = {
  root: true,
  extends: ['expo'], // Expo’s recommended config
  rules: {
    // ✅ Add your custom rules here
    'no-console': 'warn',
    'react-native/no-inline-styles': 'error',
    semi: ['error', 'always'],
    quotes: ['error', 'double'],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error'],
      },
    },
  ],
};
