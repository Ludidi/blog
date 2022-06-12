# Watch

## $watch

监听属性的初始化也是发生在 vue 实例初始化阶段的 initState 函数中，在 computed 初始化后执行了

```javascript
initWatch(vm, opts.watch);
```

下面看一下 initWatch 的实现：

```javascript
// src/core/instance/state.js
function initWatch(vm: Component, watch: Object) {
  for (const key in watch) {
    // 对watch进行遍历
    const handler = watch[key]; // 拿到每一个handler
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}
```

无论拿到的 handler 是对象还是数组，都会调用 createWatcher(如果是数组则遍历数组调用该方法)，接下来再来看下 createWatcher：

```javascript
function createWatcher(vm: Component, expOrFn: string | Function, handler: any, options?: Object) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options);
}
```

这是是对 handler 的类型做判断，拿到他最终的回调函数，最后调用 vm.$watch(expOrFn, handler, options)函数，$watch 是 vue 原型上的方法，他是在执行 setMixin 的时候定义的：

```javascript
Vue.prototype.$watch = function (expOrFn: string | Function, cb: any, options?: Object): Function {
  const vm: Component = this;
  if (isPlainObject(cb)) {
    // 判断cb是否是一个对象
    return createWatcher(vm, expOrFn, cb, options);
  }
  options = options || {};
  options.user = true; // user为true则对应watcher的run方法
  const watcher = new Watcher(vm, expOrFn, cb, options);
  if (options.immediate) {
    // 立即执行
    const info = `callback for immediate watcher "${watcher.expression}"`;
    pushTarget();
    invokeWithErrorHandling(cb, vm, [watcher.value], vm, info);
    popTarget();
  }
  return function unwatchFn() {
    watcher.teardown();
  };
};
```

- 监听属性最终会调用$watch方法，首先会判断cb是否是一个对象，如果是对象则调用createWatcher方法，这是因为$watch 是可以直接调用的，可以传递一个对象，也可以传递一个函数，所以当 cb 是一个对象的时候，重新调用 createWatcher 方法，将参数 cb 进行转换为方法来传递。
- 接着执行了 new Watcher 实例化了一个 watcher，但是要主要的是这里用的是 user = true，此时是一个 user watch。一旦数据发生变化，则调用 watcher 的 update 方法，通过 watcher 队列最终调用 run 方法，执行回调函数 cb
- 如果设置 imediate 为 true，则直接执行回调函数 cb
- 最后返回 unwatchFn 方法，它会调用 teardown 来移除 watcher

## Watcher Options

Wacher 的构造函数对 options 做了处理：

```javascript
if (options) {
  this.deep = !!options.deep;
  this.user = !!options.user;
  this.lazy = !!options.lazy;
  this.sync = !!options.sync;
}
```

### deep

如果想要对对象做深度监听的时候，需要设置 deep 为 true，例子：

```javascript
var vm = new Vue({
  data() {
    a: {
      b: 1;
    }
  },
  watch: {
    a: {
      handler(newVal) {
        console.log(newVal);
      },
    },
  },
});
vm.a.b = 2;
```

这个时候是不会 log 任何数据的，因为我们指对 watch 了 a 对象，所以只触发了 a 的 getter，并没有触发 a.b 的 getter，所以没有订阅它的变化，导致我们对 vm.a.b 赋值的时候，虽然只触发了 setter，但是没有可通知的对象，所以也就不会触发 watch 的回调函数了。而这时我们只需要设置 deep 为 true 即可，在 wacher 里面有这样一段逻辑：

```javascript
get () {
  pushTarget(this)
  let value
  const vm = this.vm
  try {
    value = this.getter.call(vm, vm)
  } catch (e) {
    if (this.user) {
      handleError(e, vm, `getter for watcher "${this.expression}"`)
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) { // deep = true
      traverse(value)
    }
    popTarget()
    this.cleanupDeps()
  }
  return value
}
```

可以查看到会调用该 traverse 函数：

```javascript
// src/core/observer/traverse.js
const seenObjects = new Set();

export function traverse(val: any) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse(val: any, seen: SimpleSet) {
  let i, keys;
  const isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return;
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return;
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) _traverse(val[i], seen);
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) _traverse(val[keys[i]], seen);
  }
}
```

实际上就是对一个对象做深层递归遍历，遍历过程中就是对一个子对象的访问，则就会触发 getter 进行依赖收集，也就是订阅他们变化的 watcher，这个函数实现还有一个小的优化，就是遍历过程中会把子响应式对象通过他们的 deep id 记录到 seenObjects，避免以后重复访问

### user

上面的$watch 创建 watcher 的时候就是一个 user watcher，详见上面的分析

### lazy

lazy 其实就是 computed watcher 实例化的实现，详见 computed 源码分析

### sync

字面意思就是同步执行，看 watcher 的 update：

```javascript
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```

当 sync 为 true 时，则直接调用 run 方法，省略了 queueWatch（watch 队列，内部会将 watcher 推送到队列，在 nextTick 后才会真正的执行回调函数）
