const { path } = require('@vuepress/utils');

module.exports = [
  [
    '@vuepress/plugin-search',
    {
      locales: {
        '/': {
          placeholder: '搜索',
        },
      },
      hotKeys: ['s', '/'],
      maxSuggestions: 5,
    },
  ],
  [
    '@vuepress/plugin-register-components',
    {
      componentsDir: path.resolve(__dirname, '../components'),
    },
  ],
  ['@vuepress/medium-zoom'],
];
