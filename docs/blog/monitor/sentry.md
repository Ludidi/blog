# 异常监控系统之 Sentry

[[toc]]

在公司项目开发的时候，客户或者实施偶尔会发现一些线上的问题过来咨询研发部的情况。对于后端的问题，服务端会有对应的日志提供查看，这也是后端服务中非常常见的习惯。而对于前端似乎只有等测试复现，能够复现还好，假如是偶现那么对前端调试造成了困难，这就无法定位问题、追查 bug 了。这几天公司事情不多，正好准备前端基建的事情，于是就关注到了 Sentry。这篇主要介绍一下如何使 Sentry 应用到系统中。

> [https://sentry.io/welcome/](https://sentry.io/welcome/)

## 注册账号

通过官网进行注册登录，可以选择在官网使用，或者自己搭建。通过官网使用的话，可能会有一些异常，比如可能必须要翻墙才行，并且是收费的，虽然可以免费试用。或者自己在服务器上搭建，[自建的可以看这个文档](https://develop.sentry.dev/self-hosted/)。这里暂时以官网的来讲解。

## 接入 SDK

由于公司项目是 vue 技术栈，这里以 vue2.x，cli3.x 为例

### 安装

```sh
yarn add @sentry/vue @sentry/tracing
```

### 初始化

创建配置文件`src/plugins/sentry.js`，路径跟着自己的项目配置

```js
import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';

const pkg = require('../../package.json');

const install = (Vue, options) => {
  Sentry.init({
    Vue,
    dsn: 'https://examplePublicKey@o0.ingest.sentry.io/5798352',
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    release: `${pkg.name}@${pkg.version}`,
    tracesSampleRate: 1.0,
    logErrors: true,
  });
};

export default install;
```

在入口文件`main.js`里面引入：

```js
import Vue from 'vue';
import App from './App';
import sentry from '@/config/sentry';

if (process.env.VUE_APP_SENTRY_SOURCEMAP) {
  // 线上引入
  Vue.use(sentry);
}
```

然后来看下配置:

1. dsn 在注册好后，通过文档教程查看可以看到自己 dsn，可以在这里配置或者写入到 env
2. integrations 特定集成
3. release 当前发布的版本,sentry 上传时会把此参数作为 release id，后面会讲到，这个很重要
4. tracesSampleRate 介于 0 和 1 之间的数字，用于控制上传到 sentry 的百分比(1 则是 100%)，必须指定值来开启
5. logErrors 是否开启错误日志

## 打包配置

### 安装 webpack 插件

```sh
yarn add @sentry/webpack-plugin -D
```

### 在 vue.config.js 里面配置

```js
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const pkg = require('../package.json');
const plugins = [];

if (process.env.VUE_APP_SENTRY_SOURCEMAP) {
  plugins.push(
    new SentryWebpackPlugin({
      release: `${pkg.name}@${pkg.version}`,
      include: './dist/js',
      ignore: ['node_modules', 'vue.config.js'],
      configFile: '.sentryclirc',
    })
  );
}

module.exports = plugins;
```

这里的环境变量`VUE_APP_SENTRY_SOURCEMAP`其实是只有在生产环境下会上传上去，接下来继续看配置:

1. release 这里的 release 一定要和 main.js 里面引入的一致，不然上报的就对应不上版本
2. include 上传的 js 文件，这个插件会把项目所有的 js 进行上传，包括 sourcemap`(必须开启 sourcemap，至于为什么，后面会详细说到)`
3. ignore 忽略的文件
4. configFile 配置文件

### 配置文件

在项目根目录下创建`.sentryclirc`文件

```yml
[auth]
token=token

[defaults]
url=https://sentry.io/
org=humanbacker
project=ims

[http]
verify_ssl=false
check_ssl_revoke=false
```

看下配置文件：

1. token 为用户令牌。进入到监控页面，依次点击 `settings => auth tokens => create new token`创建令牌，可以设置其读写权限，创建后把 token 的值改为这个。
2. url 默认为 sentry 的地址
3. org 为组织名称
4. project 为项目名称
5. verify_ssl 校验 ssl
6. check_ssl_revoke 和 windows 下的 ssl 有关

到了这一步基本上就配置好了，但是还缺一点，就是上面提到的`sourcemap`

### sourcemap

众所周知，我们在打包生产环境时会把 vue.config.js 里面的 sourcemap 配置给关闭掉，一个是为了加快打包速度，减轻文件体积，还不会把源码文件暴露给客户端。sourcemap 既然有不好的地方，为什么还要用它呢，当然是方便调试，当 js 代码报错时，因为我们的 webpack 会压缩合并代码，导致无法定位到哪一行报错，只能简单看到某个值为 undefined 或者 not function 等等，这就导致了不利于我们调试。回归到解决问题的本质上，通过 sentry 监控到问题，源 js 映射到 map 文件，再通过错误的行和列就可以帮助我们快速定位到问题了。

所以我们既想把 map 映射文件上传到 Sentry，又不愿意在生产环境中暴露我们的源代码，可以做个骚操作：

1. 打包时开启 sourcemap
2. sentry 上传完成
3. 执行删除 map 文件的脚本，再发布生产

使用 node 脚本清除 dist/js/文件夹下的 map.js 文件:

```js
// clear.map.js
const path = require('path');
const fs = require('fs');
const ProgressBar = require('progress');

const READ_FILE_PATH = './dist/js';

try {
  const files = fs.readdirSync(READ_FILE_PATH);
  const removeFiles = files.filter((name) => /\.js\.map$/.test(name));

  const bar = new ProgressBar('[ :bar ]', { total: removeFiles.length });

  removeFiles.forEach((file) => {
    const filePath = path.join(__dirname, `../${READ_FILE_PATH}/${file}`);
    fs.rmSync(filePath);
    bar.tick();
    if (bar.complete) {
      console.log('\n Remove SourceMap Success \n');
    }
  });
} catch (error) {
  throw error;
}
```

添加命令，执行`deploy`即可

```json
// package.json
{
  "script": {
    ...
    "clear:map": "node build/clear.map.js",
    "deploy": "npx yarn build--prod && npx yarn clear:map"
    ...
  }
}
```

## 总结

到这里，Sentry 就集成到项目里了，这下线上再有报错就可以快速定位问题，还可以查看到用户的操作历史便于快速复现问题了。

<Gitalk />
