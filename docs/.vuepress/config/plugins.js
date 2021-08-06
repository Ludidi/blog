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
  ['@vuepress/plugin-pwa'],
  [
    '@vuepress/plugin-pwa-popup',
    {
      locales: {
        '/zh/': {
          message: '发现新内容可用',
          buttonText: '刷新',
        },
      },
    },
  ],

  [
    '@vuepress/plugin-register-components',
    {
      componentsDir: path.resolve(__dirname, '../components'),
    },
  ],

  // [
  //   '@vssue/vuepress-plugin-vssue',
  //   {
  //     platform: 'github-v4', //v3的platform是github，v4的是github-v4
  //     locale: 'zh', //语言
  //     // 其他的 Vssue 配置
  //     owner: 'ludidi', //github账户名
  //     repo: 'blog', //github一个项目的名称
  //     clientId: '8d16a43c16ffb9fbba0b', //注册的Client ID
  //     clientSecret: 'e959daa45334b3063d3db4c6ab3c312156bc203b', //注册的Client Secret
  //     autoCreateIssue: false, // 自动创建评论，默认是false，最好开启，这样首次进入页面的时候就不用去点击创建评论的按钮了。
  //   },
  // ],
];
