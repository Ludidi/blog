# 定时任务

[[toc]]

## node-schedule

基于 Node.js 的定时任务，设定某个程序或者脚本在哪个时间内调用

### 安装

```shell
npm install node-schedule
```

### 示例

```js
const schedule = require('node-schedule');

const job = schedule.scheduleJob('5 * * * *', function () {
  console.log('每当分钟为5时，执行job');
});
```

### Cron 表达式

Cron 表达式是一个字符串，包括 5-6 个由空格分割的字段，表示一组时间，作为执行某个程序的时间表。其实早之前使用 Jenkins 做自动化时就已经接触到了，这里再总结一下。

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ 星期几 (0 - 7) (0或者7代表星期日)
│    │    │    │    └───── 月 (1 - 12)
│    │    │    └────────── 每月的哪一天 (1 - 31)
│    │    └─────────────── 小时 (0 - 23)
│    └──────────────────── 分钟 (0 - 59)
└───────────────────────── 秒 (0 - 59, 可选)
```

每个字段可使用的通配符有`*`、`-`、`/`、`,`

- `0 */5 * * * *` 代表每天每隔五分钟执行 job
- `0 0 8 * * 1-5` 代表周一至周五八点执行 job
- `0 0 8 * * 0,1-5` 代表每周日和每周一至周五，八点执行 job
- `0 0 8-20/2 * * 1-5` 代表周一至周五从八点开始，每隔 2 小时执行 job

### 基于 Date

也可以指定某个时间节点执行，例如想要在 2021 年 10 月一号八点执行

```js
const schedule = require('node-schedule');
const date = new Date(2021, 9, 1, 8, 0, 0);

const job = schedule.scheduleJob(date, function () {
  console.log('The world is going to end today.');
});
```

### 其他

如若取消 job 可以调用`cancel()`方法。除了基于 Cron 和 Date 外，还可以定义重复规则调用`RecurrenceRule`,也可以使用对象的形式来创建时间表。 [详见文档](https://github.com/node-schedule/node-schedule)

## 题外话 - 钉钉自动化打卡

https://github.com/node-schedule/node-schedule
https://cloud.tencent.com/developer/article/1612643

自从公司开始打卡了之后，就经常忘记下班打卡，于是便有了钉钉自动化打卡的想法 😂

先大致讲一下实现思路：

1. 利用钉钉的快捷打卡功能
2. 基本上确定平常哪个时间段走到打卡范围
3. 在这个时间内，发送通知提醒需要打卡了
4. 唤醒钉钉应用，自动打卡

### 设置快捷打卡

![快捷打卡](/images/node/schedule-1-1.jpg)

### 安装 Bark 应用

安装 Bark 应用，注册设备，并开启推送。这个时候可以看到 api 地址，后面的内容便可以设置自己想要推送的内容。既然推送有了，这时还需要唤醒 app，便采取 URL 参数的方式，通过点击推送自动跳转至 app 即可。而跳转 app 的方式 可以通过`url scheme`来达到效果，查得钉钉的 url scheme 为`dingtalk://snowdreams1006.tech/`。于是便有了完整的推送请求，顺便加一个专门的提示音。

> http://api.day.app/mykey/message?sound=glass&url=dingtalk://snowdreams1006.tech/

然后在手机浏览器上打开以上配置的地址，便可接收到推送，点击推送唤醒 app。接下来就是最后一步，结合 node 的定时服务，实现我们的定时推送。

### 定时推送

话不多说，直接上代码：

```js
const schedule = require('node-schedule');
const http = require('http');

const sendBarkMessage = (message) => {
  const req = http.request(
    `http://api.day.app/bQFWyfTbjDdkgbd8V3gf4F/${message}?sound=glass&url=dingtalk://snowdreams1006.tech/`,
    (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log('sendBarkMessage', `BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('sendBarkMessage', 'No more data in response.');
      });
    }
  );
  req.on('error', (e) => {
    console.error('sendBarkMessage', `problem with request: ${e.message}`);
  });

  req.end();
};

// 定时任务
const scheduleCronstyle = () => {
  // 周一至周五 早上八点五十
  schedule.scheduleJob('0 50 8 * * 1-5', () => {
    sendBarkMessage('上班打卡了~ 还有十分钟就要送老板鱼缸小石头咯~');
  });

  // 周一至周五 晚上六点
  schedule.scheduleJob('0 0 18 * * 1-5', () => {
    sendBarkMessage('打卡下班了~ 不然老板鱼缸里又要多养小鱼咯~');
  });
};

scheduleCronstyle();
```

最后部署在自己的服务器即可。

<Gitalk />
