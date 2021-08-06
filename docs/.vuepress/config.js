const navbar = require('./config/navbar');
const sidebar = require('./config/sidebar');
const plugins = require('./config/plugins');

module.exports = {
  base: '/',

  head: [['link', {rel: 'icon', href: 'favicon.ico'}]],

  lang: 'zh-CN',
  title: 'Ludd',
  description: 'ludd link 博客 个人 学习',

  themeConfig: {
    repo: 'Ludidi/blog',

    docsDir: 'docs',

    locales: {
      '/': {
        // page meta
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdatedText: '上次更新',
        contributorsText: '贡献者',

        // custom containers
        tip: '提示',
        warning: '注意',
        danger: '警告',

        // 404 page
        notFound: [
          '这里什么都没有',
          '我们怎么到这来了？',
          '这是一个 404 页面',
          '看起来我们进入了错误的链接',
        ],
        backToHome: '返回首页',

        // a11y
        openInNewWindow: '在新窗口打开',
        toggleDarkMode: '切换夜间模式',
      }
    },

    navbar,
    sidebar,
  },
  plugins,
};
