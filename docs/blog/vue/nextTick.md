# nextTick 原理

> 源码：https://github1s.com/vuejs/vue/blob/HEAD/src/core/util/next-tick.js

1. 先去判断运行环境是否支持 promise (/native code/)

   > 创建一个 promise，通过 promise.then 进行回调

2. 判断不是 IE 浏览器，且运行环境支持 MutationObserver (MutationObserver 接口提供了监视对 DOM 树所做更改的能力。它被设计为旧的 Mutation Events 功能的替代品)

   > 实例化 MutationObserver，参数为回调函数
   > 创建一个 textNode(document.createTextNode)
   > 通过监听方法 observe, 监听 textNode
   > textNode 发生改变，触发回调

3. 判断是运行环境支持 setImmediate (只有 IE 和 node 0.10 版本支持。异步函数)

   > 调用 setImmediate 触发回调

4. 采用 setTimeOut 触发回调

<Gitalk />
