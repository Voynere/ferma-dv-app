module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: [
        ['transform-remove-console', { exclude: ['error', 'warn'] }],
      ],
    },
  },
};
