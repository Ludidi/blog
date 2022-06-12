# nextTick 原理

> 源码：https://github1s.com/vuejs/vue/blob/HEAD/src/core/util/next-tick.js

## 执行顺序

1. 定义 callbacks 数组，把回调函数放入到 callbacks 等待执行
2. 将执行函数 flushCallbacks 放入到微任务或者宏任务中，定义其变量为 timerFunc(会根据浏览器执行环境来判断走哪个微任务或者宏任务，判断顺序为 Promise => MutationObserver => setImmediate => setTimeout)

   - 先去判断运行环境是否支持 promise (/native code/)

     - 创建一个 promise，通过 promise.then 进行回调

   - 判断不是 IE 浏览器，且运行环境支持 MutationObserver (MutationObserver 接口提供了监视对 DOM 树所做更改的能力。它被设计为旧的 Mutation Events 功能的替代品)

     - 实例化 MutationObserver，参数为回调函数

     - 创建一个 textNode(document.createTextNode)
     - 通过监听方法 observe, 监听 textNode
     - textNode 发生改变，触发回调

   - 判断是运行环境支持 setImmediate (只有 IE 和 node 0.10 版本支持。异步函数)

     - 调用 setImmediate 触发回调

   - 采用 setTimeOut 触发回调

3. 若执行回调数组为空时，pending 为 false，此时会执行 timerFunc，并设置 peding 为 true，阻止后面进入队列的执行
4. timerFunc 内部则遍历数组执行，重置其 pending 状态

<Gitalk />
