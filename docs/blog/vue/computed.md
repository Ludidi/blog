# Computed

## initComputed

computed 初始化是发生在 vue 实例初始化阶段的 initState 函数中，执行了其`initComputed`:

```javascript
const computedWatcherOptions = { lazy: true };

function initComputed(vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = (vm._computedWatchers = Object.create(null)); // 创建空对象
  // computed properties are just getters during SSR
  const isSSR = isServerRendering();

  for (const key in computed) {
    // 遍历computed
    const userDef = computed[key];
    const getter = typeof userDef === 'function' ? userDef : userDef.get; // 获取到getter
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(`Getter is missing for computed property "${key}".`, vm);
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions); // 为每一个getter实例化watcher
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef); // 如果computed的key不是vm的属性
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm);
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(`The computed property "${key}" is already defined as a method.`, vm);
      }
    }
  }
}
```

函数首先创建一个 vm.\_computedWatchers 为一个空对象，然后对 computed 对象做遍历，然后拿到每个计算属性命名为 userDef，接着判断 userDef 是一个函数()=>{}，则直接返回，如果是一个对象{get(){}, handler(){}}则获取 userDef 的 getter 函数。

接下来为每一个 getter 创建了一个 watcher，最后则判断 key 不是 vm 的属性，调用`defineComputed`

## defineComputed

```javascript
export function defineComputed(target: any, key: string, userDef: Object | Function) {
  const shouldCache = !isServerRendering();
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if (process.env.NODE_ENV !== 'production' && sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(`Computed property "${key}" was assigned to but it has no setter.`, this);
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

利用 Object.defineProperty 给计算属性对应的 key 值添加 getter 和 setter，上面大部分的其实是判断是否是服务端渲染，如果不是服务端渲染则调用`createComputedGetter`方法作为 get

## createComputedGetter

```javascript
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        // 对应第一行代码的lazy属性
        watcher.evaluate(); // 调用get方法，获取到value并赋值给watcher，并且把dirty设置为false
      }
      if (Dep.target) {
        watcher.depend(); // 依赖收集
      }
      return watcher.value;
    }
  };
}
```

返回了一个函数`computedGetter`，其实就是对应的 getter，那么这就是整个 computed 初始化的过程。

## 缓存

来重点看一下 watcher.evaluate()里面的代码

```javascript
// watcher.js
evaluate () {
  this.value = this.get()
  this.dirty = false
}
```

然后通过 get 的方法获取到 value，再将 dirty 设置为 false。所以每次读取 computed 的值的时候，通过 get 方法只要 dirty 没有设置为 true，那么将从 watcher.value 获取之前的值，这就是 computed 的缓存机制。

## 不缓存

在初始化 computed 的时候，每次读取都会将 computed 的响应式数据进行依赖收集，这时假如修改了某一个的响应式数据，则会触发 dep.notify()，然后通知所有的 watcher 集合调用 update 方法，在 update 里面则又把 dirty 设置为 true，所以重新 get computed 时，会重新的计算 get 方法获取到实时的 value 值。

## 总结

computed 的缓存机制设计的相当巧妙，通过 watcher、object.defineProperty、lazy、dirty 实现数据的缓存机制，值得学习。
