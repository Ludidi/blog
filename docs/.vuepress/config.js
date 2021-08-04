const navbar = require('./config/navbar');
const sidebar = require('./config/sidebar');
const plugins = require('./config/plugins');

module.exports = {
  // 站点配置
  lang: 'zh-CN',
  title: 'Ludd',
  description: 'ludd link 博客 个人 学习',

  themeConfig: {
    repo: 'https://github.com/Ludidi',
    navbar,
    sidebar,
  },
  plugins,
};
