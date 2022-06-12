# Virual Dom 与 Diff

## Virual Dom

其实就是虚拟 dom，一个用来表示真实 dom 的对象，例如：

```html
<ul id="list">
  <li class="item">哈哈</li>
  <li class="item">呵呵</li>
  <li class="item">嘿嘿</li>
</ul>
```

转换为虚拟 dom 则为：

```javascript
let oldVDOM = {
  // 旧虚拟DOM
  tagName: 'ul', // 标签名
  props: {
    // 标签属性
    id: 'list',
  },
  children: [
    // 标签子节点
    {
      tagName: 'li',
      props: { class: 'item' },
      children: ['哈哈'],
    },
    {
      tagName: 'li',
      props: { class: 'item' },
      children: ['呵呵'],
    },
    {
      tagName: 'li',
      props: { class: 'item' },
      children: ['嘿嘿'],
    },
  ],
};
```

如果修改了某一条数据后，虚拟 dom 则发生改变，然后再由虚拟 dom 渲染为真实 dom

![image.png](/images/vue/vnode/image-1.png)

而为了提高虚拟 dom 的渲染性能，则会有一个 diff 算法的存在

## Diff 算法

![image.png](/images/vue/vnode/image-2.png)
diff 算法只会修改需要修改的节点，其他的都是不变的，所以 diff 算法是一种对比算法，进而提高效率

- 虚拟 DOM 算法的损耗计算：总损耗 = 虚拟 DOM 增删改 + 真实 DOM 差异增删改（与算法的效率有关） + 排版与重绘（较少的节点）
- 直接操作真实 DOM 的损耗时间：总损耗 = 真实 DOM 完全增删改 + 排版与重构（可能较多节点）

## Diff 算法的原理

### 同层对比

新旧 dom 对比的时候，diff 算法比较只会在同层级进行，不会跨层级比较。所以 diff 算法是深度优先算法，时间复杂度为 O(n)
![image.png](/images/vue/vnode/image-3.png)

### Diff 对比流程

当数据改变时会触发 setter，并通过 Dep.notify 去通知所有的订阅者 wactcher，订阅者们就会调用 patch 方法，给真实 dom 打补丁，更新相应的视图

newVnode 和 oldVnode：同层的新旧虚拟节点
![image.png](/images/vue/vnode/image-4.png)

### Patch 方法

> 对比当前同层的虚拟节点是否为同一种类型的标签(同一类型的标准）
>
> - 是：继续执行 patchVnode 方法进行深层对比
> - 否：直接将整个节点替换为新虚拟节点

```javascript
// 核心原理
function patch(oldVnode, newVnode) {
  // 比较是否为一个类型的节点
  if (sameVnode(oldVnode, newVnode)) {
    // 是：继续进行深层比较
    patchVnode(oldVnode, newVnode);
  } else {
    // 否
    const oldEl = oldVnode.el; // 旧虚拟节点的真实DOM节点
    const parentEle = api.parentNode(oldEl); // 获取父节点
    createEle(newVnode); // 创建新虚拟节点对应的真实DOM节点
    if (parentEle !== null) {
      api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl)); // 将新元素添加进父元素
      api.removeChild(parentEle, oldVnode.el); // 移除以前的旧元素节点
      // 设置null，释放内存
      oldVnode = null;
    }
  }

  return newVnode;
}
```

### sameVnode 方法

> patch 关键的一步就是 sameVnode 方法判断是否是同一类型节点

```javascript
function sameVnode(oldVnode, newVnode) {
  return (
    oldVnode.key === newVnode.key && // key值是否一样
    oldVnode.tagName === newVnode.tagName && // 标签名是否一样
    oldVnode.isComment === newVnode.isComment && // 是否都为注释节点
    isDef(oldVnode.data) === isDef(newVnode.data) && // 是否都定义了data
    sameInputType(oldVnode, newVnode) // 当标签为input时，type必须是否相同
  );
}
```

### patchVnode 方法

> 做了以下事情：
>
> - 找到对应的真实 dom，称为 el
> - 判断 newVnode 和 oldVnode 是否指向同一个对象，如果是，直接 return
> - 如果他们都有文本节点且不想等，那么 el 的文本节点设置为 newVnode 的文本节点
> - 如果 oldVnode 有子节点而 newVnode 没有，则删除 el 的子节点
> - 如果 oldVnode 没有子节点而 newVnode 有，则将 newVnode 的子节点真实化后添加到 el
> - 如果两者都有子节点，则执行 updateChildren 函数比较子节点

```javascript
function patchVnode(oldVnode, newVnode) {
  const el = (newVnode.el = oldVnode.el); // 获取真实DOM对象
  // 获取新旧虚拟节点的子节点数组
  const oldCh = oldVnode.children,
    newCh = newVnode.children;
  // 如果新旧虚拟节点是同一个对象，则终止
  if (oldVnode === newVnode) return;
  // 如果新旧虚拟节点是文本节点，且文本不一样
  if (oldVnode.text !== null && newVnode.text !== null && oldVnode.text !== newVnode.text) {
    // 则直接将真实DOM中文本更新为新虚拟节点的文本
    api.setTextContent(el, newVnode.text);
  } else {
    // 否则

    if (oldCh && newCh && oldCh !== newCh) {
      // 新旧虚拟节点都有子节点，且子节点不一样

      // 对比子节点，并更新
      updateChildren(el, oldCh, newCh);
    } else if (newCh) {
      // 新虚拟节点有子节点，旧虚拟节点没有

      // 创建新虚拟节点的子节点，并更新到真实DOM上去
      createEle(newVnode);
    } else if (oldCh) {
      // 旧虚拟节点有子节点，新虚拟节点没有

      //直接删除真实DOM里对应的子节点
      api.removeChild(el);
    }
  }
}
```

### updateChildren 方法

> 这是 patchVnode 里面最重要的一个方法，新旧虚拟节点对比，称为首尾指针法

例如：

```html
<ul>
  <li>a</li>
  <li>b</li>
  <li>c</li>
</ul>

修改数据后

<ul>
  <li>b</li>
  <li>c</li>
  <li>e</li>
  <li>a</li>
</ul>
```

那么新旧两个子节点集合以及其首尾指针为：
![image.png](/images/vue/vnode/image-5.png)
然后会进行对比，总共有五种比较情况：

1. oldS 和 newS 使用 sameVnode 方法比较
1. oldS 和 newE 使用 sameVnode 方法比较
1. oldE 和 newS 使用 sameVnode 方法比较
1. oldE 和 newE 使用 sameVnode 方法比较
1. 如果上面的逻辑都匹配不到，再把所有旧子节点的 key 做一个映射到旧节点下标的 key => index 表，然后用新 vnode 的 key 去找出在旧节点中可以复用的位置

![image.png](/images/vue/vnode/image-6.png)
分析比较过程：
![image.png](/images/vue/vnode/image-7.png)

1. 第一步

oldS = a， oldE = c
newS = b，newE = a
比较结果：oldS 和 newE 相等，需要把节点 a 移动到 newE 对应的位置，也就是末尾，同时 oldS++，newE--
![image.png](/images/vue/vnode/image-8.png)

2. 第二步

oldS = b, oldE = c
newS = b, newE = e
比较结果：oldS 和 newE 相等，需要把节点 b 移动到 newS 所对应的位置，同时 oldS++，newS++
![image.png](/images/vue/vnode/image-9.png)

3. 第三步

oldS = c，oldE = c
newS = c，newE = e
比较结果：oldS、oldE 和 newS 相等，需要把节点 C 移动到 newS 所对应的位置，同时 oldS++，newS++
![image.png](/images/vue/vnode/image-10.png)

4. 第四步

oldS > oldE，则 oldS 先遍历完了，而 newS 没遍历完，说明 new 比 old 多，所以将多出来的节点插入到真实对应 dom 的位置上
![image.png](/images/vue/vnode/image-11.png)

## Key

> for 循环的时候为什么不建议用 index 作为 key

在进行子节点的 diff 算法过程中，会进行新旧节点和新首节点的 same 对比，这一步命中了逻辑 patchVnode。如果想要保留其他没有操作的节点，只更新增删改的节点的话，则需要一个独一无二的 key，保证 key 不会变化即可。

## 参考

[https://juejin.cn/post/6994959998283907102#heading-10](https://juejin.cn/post/6994959998283907102#heading-10)
