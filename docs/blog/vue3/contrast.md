# 对比 Vue2

## 静态类型

- vue2.0 采用 flow 作为 js 的静态类型检查，flow 是 Facebook 出品的 javascript 静态类型检查工具，可以以较小的成本将现有的 js 代码迁入。但 flow 推导类型存在一定的问题。
- 但在 vue3 就彻底采用 ts 来编写 vue 了，这样也不需要维护 d.ts 文件，并就目前的 ts 生态来说只会越来越好了。

## 性能优化

### 源码体积优化

- 移除冷门的 feature，如 filter，inline-template
- 引入 tree-shaking 技术，减少打包体积

### 数据劫持优化

- Vue2：通过 object.defineProperty 来劫持某个 key 值进行 getter 和 setter，但是它并不能检测对象属性的添加和删除。所以提供了$set，$delete 的实例方法。其次因为在运行的时候无法判断到底会访问哪个属性，所以对于嵌套层级过深的对象，则需要递归遍历，将每一层都变为响应式对象。
- Vue3：通过 Proxy API 做数据劫持，因为它劫持的是整个对象，所以对于对象的添加删除都可以检测的到。Proxy 其实也不能监听到深层次对象的变化，所以 vue3 的处理方式则是在 getter 中进行递归响应式，这样做的好处是真正访问到的内部对象才会变成响应式，而不是像 vue2 那样初始化时就开始深层递归。

### 编译优化

vue2 渲染 dom 的过程
![image.png](/images/vue3/contrast/image-1.png)

vue2 则是通过 new Vue 来创建 vue 实例并渲染 dom 的，响应式的过程其实是在 init 阶段发生，而 vue3 除了对响应式阶段的优化，还对`patch`过程做了优化。

vue2 数据更新是组件级的，最燃能保成触发更新组件的最小化，但是在单个组件内部依然需要遍历该组件的整个 vnode 树。

```html
<template>
  <div id="content">
    <p class="text">static text</p>
    <p class="text">static text</p>
    <p class="text">{{message}}</p>
    <p class="text">static text</p>
    <p class="text">static text</p>
  </div>
</template>
```

diff 过程：
![image.png](/images/vue3/contrast/image-2.png)

可以看到，代码中只有一个动态节点，所有这里面有很多 diff 和遍历是不需要的，这就会导致 vnode 的性能和模版代码的多少有关，和动态节点的数量无关，当一些组件的整个模版内只有少量的动态节点时，这些遍历都是性能的浪费。

而 vue3 则是通过编译阶段对静态模版的分析，编译生产了 Block tree。Block tree 是一个将模版基于动态节点指令切割的嵌套区块，每个区块内部的节点结构都是固定的，而且每个区块只需要以一个 array 来追踪自身包涵的动态节点。借助 block tree，就可以进行优化，量级则只是动态内容的数量上了。

## 语法优化

- vue2 是通过各个配置项如 data，computed，watch，methods，props 等这些 options 分类。当有复用的逻辑的时候，需要用 mixin 来混入（mixin 存在的问题：命名冲突和数据来源不明确）
- vue3 的话则是通过 setup 函数，将当前组件内的代码放到此代码块中。复用逻辑时，是采用 hooks 思想（来源清晰，不会出现命名冲突的问题，除了这些优势外，还有就是因为他们是一些函数，在函数被调用的时候，类型可以被推倒出来，不像 options 所用的东西都是采用 this，另外对 tree-shaking 友好，代码容易压缩）
