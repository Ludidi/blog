# PM2 常用命令

> Node 进程管理器，具有负载均衡，守护进程，监控，日志等
> https://pm2.keymetrics.io/docs/usage/quick-start/

# 安装

```
npm install -g pm2
// or
yarn global add pm2
```

# 常用命令

```shell
pm2 start app.js                # 启动app.js应用程序
pm2 start app.js -i 4           # cluster mode 模式启动4个app.js应用实例 ，4个应用程序会自动负载均衡
pm2 start app.js --name index   # 启动应用程序并命名为index
pm2 start app.js --watch        # 当文件变化是自动重启
pm2 start script.sh             # 启动bash脚本

pm2 list                        # 列出pm2启动的所有应用程序
pm2 jlist                       # 以JSON格式列出pm2启动的所有应用程序
pm2 prettylist                  # 以漂亮的JSON格式列出pm2启动的所有应用程序

pm2 describe [id]         	    # 显示指定id的所有信息

pm2 monit                       # 显示每个应用程序的CPU和内存占用情况

pm2 logs                        # 显示所有应用程序的日志
pm2 logs [app-name]             # 显示指定应用程序的日志
pm2 reloadLogs                  # 重新加载所有日志
pm2 flush                       # 清空所有日志

pm2 stop all                    # 停止所有应用程序
pm2 stop [id]                   # 停止指定id的应用程序

pm2 restart all                 # 重启所有应用程序
pm2 restart [id]                # 重启指定id的应用程序

pm2 reload all                  # 重启cluster mode下的所有应用

pm2 delete all                  # 关闭并删除所有应用程序
pm2 delete [id]                 # 关闭并删除指定id的应用程序

pm2 startup                     # 创建开机自启动命令
pm2 save                        # 保存当前应用列表
pm2 resurrect                   # 重新加载保存的应用列表
pm2 update                      # 保存进程，杀掉pm2并恢复进程
```

# 高级用法

> 可通过 ecosystem.config.js，进行配置，详见：https://pm2.keymetrics.io/docs/usage/application-declaration/

```javascript
// ecosystem.config.js 用于vue nuxt
module.exports = {
  apps: [
    {
      name: APPNAME,
      exec_mode: 'cluster',
      instances: '10', // Or a number of instances
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start',
      env: {
        NUXT_ENV: 'dev',
        NODE_ENV: 'development',
      },
      env_prod: {
        NUXT_ENV: 'prod',
        NODE_ENV: 'production',
      },
    },
  ],
};
```

<Gitalk />
