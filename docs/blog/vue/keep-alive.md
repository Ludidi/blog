# keep-alive

vue的内置组件：
> src/core/components/keep-alive.js

## Props
主要是根据`include`与`exclude`两个属性来允许组件有条件的进行缓存，二者都可以用逗号分隔字符串，正则表达式或者一个数组来表示
## 生命周期

-  created：创建一个cache对象，作为缓存容器，保存vnode节点  
```javascript
created() {
    // 缓存对象
    this.cache = Object.create(null);
    this.keys = [];
},
```

-  destroyed：在组件销毁的时候清除cache缓存中所有的组件实例  
```javascript
destroyed() {
    // 销毁所有cache缓存中的实例对象
    for (const key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys);
    }
},
```
## render
```javascript
render() {
    const slot = this.$slots.default;
    const vnode: VNode = getFirstComponentChild(slot); // 得到插槽里面的第一个组件
    const componentOptions: ?VNodeComponentOptions =
        vnode && vnode.componentOptions;
    if (componentOptions) {
        // check pattern
        const name: ?string = getComponentName(componentOptions); // 获取组件名称，否则取tag
        const { include, exclude } = this;

        // name不在include中或者ame在excluded中，直接返回vnode
        if (
            // not included
            (include && (!name || !matches(include, name))) ||
            // excluded n
            (exclude && name && matches(exclude, name))
        ) {
            return vnode;
        }

        const { cache, keys } = this;
        const key: ?string =
            vnode.key == null
            ? // same constructor may get registered as different local components
            // so cid alone is not enough (#3269)
            componentOptions.Ctor.cid +
            (componentOptions.tag ? `::${componentOptions.tag}` : "")
        : vnode.key;
        // 如果已经做过缓存，则直接从缓存取
        if (cache[key]) {
            vnode.componentInstance = cache[key].componentInstance;
            // make current key freshest
            remove(keys, key);
            keys.push(key);
        } else {
            // delay setting the cache until update
            // 延迟设置缓存，直到更新
            this.vnodeToCache = vnode; // 将vnode缓存起来
            this.keyToCache = key;
        }

        // keepAlive标记
        vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0]);
}
```

首先通过getFirstComponentChild获取第一个子组件，获取该组件的name。

接下来会将这个name通过include与exclude属性进行匹配，匹配不成功则不需要缓存直接返回vnode，匹配成功则从cache中取出vnode。

```javascript
// 检测name是否匹配
function matches(
	pattern: string | RegExp | Array<string>,
	name: string
): boolean {
    if (Array.isArray(pattern)) {
        // 数组
        return pattern.indexOf(name) > -1;
    } else if (typeof pattern === "string") {
        // 字符串，a,b,c
        return pattern.split(",").indexOf(name) > -1;
    } else if (isRegExp(pattern)) {
        // 正则
        return pattern.test(name);
    }
    /* istanbul ignore next */
    return false;
}
```

然后根据key在this.cache中查找，如果存在则缓存过，直接将缓存vnode的componentInstance组件实例覆盖到当前的vnode上，否则将vnode进行缓存

```javascript
// 如果已经做过缓存，则直接从缓存取
if (cache[key]) {
    vnode.componentInstance = cache[key].componentInstance;
    // make current key freshest
    remove(keys, key);
    keys.push(key);
} else {
    // delay setting the cache until update
    // 延迟设置缓存，直到更新
    this.vnodeToCache = vnode; // 将vnode缓存起来
    this.keyToCache = key;
}
```
## watch
通过watch来监听include和exclude，在改变的时候修改cache缓存中的数据

```javascript
this.$watch("include", (val) => {
    pruneCache(this, (name) => matches(val, name));
});
this.$watch("exclude", (val) => {
    pruneCache(this, (name) => !matches(val, name));
});
```

pruneCache:

```javascript
function pruneCache(keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance;
  for (const key in cache) {
    // 取出cache的vnode
    const entry: ?CacheEntry = cache[key];
    if (entry) {
      const name: ?string = entry.name;
      // 不符合filter条件的，销毁vnode实例，并从cache中移除
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

// 销毁对应的vnode实例
function pruneCacheEntry(
  cache: CacheEntryMap,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const entry: ?CacheEntry = cache[key];
  if (entry && (!current || entry.tag !== current.tag)) {
    entry.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}
```

vue内部将dom节点抽象成一个vnode节点，keep-alive组件的缓存也是基于vnode节点而不是直接存储dom结构。它将满足条件的组件在cache中缓存起来，在需要重新渲染的时候再将vnode节点从cache对象中取出并渲染的。

