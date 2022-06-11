module.exports = {
  '/blog': [
    {
      text: 'CSS',
      children: ['/blog/css/bfc.md', '/blog/css/reduced-motion.md', '/blog/css/matirx.md'],
    },
    {
      text: 'JavaScript',
      children: [
        '/blog/js/disorder-object.md',
        '/blog/js/defineProperty.md',
        '/blog/js/proxy.md',
        '/blog/js/extends.md',
      ],
    },
    {
      text: 'TypeScript',
      children: ['/blog/ts/types-or-interfaces.md', '/blog/ts/overload.md'],
    },
    {
      text: 'Vue',
      children: ['/blog/vue/proxy.md', '/blog/vue/keep-alive.md', '/blog/vue/nextTick.md', '/blog/vue/vnode.md'],
    },
    {
      text: '小程序',
      children: ['/blog/wx/wxs.md'],
    },
    {
      text: 'Node',
      children: ['/blog/node/pm2.md', '/blog/node/schedule.md'],
    },
    {
      text: '性能',
      children: ['/blog/performance/render.md'],
    },
    {
      text: '监控',
      children: ['/blog/monitor/sentry.md'],
    },
  ],
};
