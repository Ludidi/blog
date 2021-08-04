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
];
