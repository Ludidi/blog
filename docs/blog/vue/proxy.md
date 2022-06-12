# 数据响应式
## 起步
Vue数据响应式主要涉及`Observe`，`Watcher`，`Dep`这三个主要的类；因此弄清楚vue响应式变化需要明白这三个类之间是如何运作联系的，以及他们的原理，负责的逻辑操作。这里采用vue2.x版本作为分析，后面再详细分析vue3.0。

由于Vue会在初始化时对属性执行getter/setter，所以属性必须在data对象上存在才能让vue转换其响应式。
![](https://cn.vuejs.org/images/data.png#crop=0&crop=0&crop=1&crop=1&id=EsN6u&originHeight=750&originWidth=1200&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)
> 简单概括就是观察者模式+数据劫持


## initData
> src/core/instance/state.js

```javascript
// 初始化data
function initData (vm: Component) {
  let data = vm.$options.data // 获得data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  // 遍历data
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) { // 判断data是否和methods中的key重复
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) { // 判断data是否和props中的key重复
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      // 判断是否保留字段
        
      // 将data代理到vm实例上
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 这里通过observer实例化对象，开始对数据进行绑定，asRootData用来计算实例化根数据的个数
  observe(data, true /* asRootData */)
}
```
这里initData做了2件事情：

1. 将_data代理到vm上
1. 通过执行observe将所有data变成可观察的，即对data定义的每个属性进行getter/setter
### Observe
> src/core/observer/index.js

```javascript
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 判断是否有__ob__这个属性，代表是否存在Observer实例，如果没有则会新建一个
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    // 确保value是个对象，而不是函数或者Regexp等，并判断对象是否可扩展，shouldObserve为true时也才会进行Observe
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }

  // 这里根据根数据计数
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```
尝试创建一个Observer实例，如果创建成功则返回Observer实例，如果已有Observer则返回现有的。
这里的`new Oberver(value)`就是实现响应式的核心方法之一了，通过它将data转变可以观察的。
## Observer
> src/core/observer/index.js

```javascript
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
      this.value = value
      this.dep = new Dep()
      this.vmCount = 0
      // 将Observer实例绑定到data的__ob__属性上去
      def(value, '__ob__', this)	
      // 如果是数组
      if (Array.isArray(value)) {	
          // 判断浏览器是否支持__proto__属性
          if (hasProto) {	
              // 如果支持则直接覆盖原型的方法来修改目标对象
              protoAugment(value, arrayMethods)
          } else {
              // 直接覆盖数组对象原型
              copyAugment(value, arrayMethods, arrayKeys)
          }
          // 对数组的每一项成员进行遍历并observe
          this.observeArray(value)
      } else {
          // 如果是对象则直接walk绑定
          this.walk(value)
      }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
      const keys = Object.keys(obj)
      // walk方法会遍历对象的每一个属性进行defineReactive绑定
      for (let i = 0; i < keys.length; i++) {
          defineReactive(obj, keys[i])
      }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
      for (let i = 0, l = items.length; i < l; i++) {
          observe(items[i])
      }
  }
}
```
由上面可知：

1. 首先将Observer实例绑定到data的`__ob__`属性上去，防止重复绑定
1. 如data为数组，先实现对应的数组原生方法，再将数组成员进行observe，成为响应式数据
1. 否则执行walk()方法，遍历data所有的数据，进行getter/setter绑定，这里的核心就是`defineReactive`
```javascript
// 为对象defineProperty上在变化时通知的属性
export function defineReactive (
	obj: Object,
	key: string,
  	val: any,
  	customSetter?: ?Function,
  	shallow?: boolean
) {
    // 在闭包中定义一个dep对象
    const dep = new Dep()

    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {
        return
    }

    // cater for pre-defined getter/setters
    // 如果之前该对象已经预设了getter/setter函数，则将其取出，新定义的会将其执行，不会覆盖之前定义的
    const getter = property && property.get
    const setter = property && property.set
    if ((!getter || setter) && arguments.length === 2) {
        val = obj[key]
    }

    // 对象的子对象递归进行observe并返回子节点的observer对象
    let childOb = !shallow && observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter () {
            // 如果原本对象拥有getter方法则执行
            const value = getter ? getter.call(obj) : val
            if (Dep.target) {
                // 进行依赖收集
                dep.depend()
                if (childOb) {
                    // 子对象进行依赖收集，将同一个watcher观察者实例放入到两个depend中，一个时正在本身闭包的deoend，一个时子元素的depend
                    childOb.dep.depend()
                    if (Array.isArray(value)) {
                        // 是数组则需要对每一个成员进行依赖收集，如果数组的成员还是数组，则递归
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set: function reactiveSetter (newVal) {
            // 通过getter方法获取当前值
            const value = getter ? getter.call(obj) : val
            // 与新值比较，一致则不需要执行下面的操作
            /* eslint-disable no-self-compare */
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            /* eslint-enable no-self-compare */
            if (process.env.NODE_ENV !== 'production' && customSetter) {
                customSetter()
            }
            // #7981: for accessor properties without setter
            if (getter && !setter) return
            if (setter) {
                // 如果对象拥有setter则执行setter
                setter.call(obj, newVal)
            } else {
                val = newVal
            }
            // 新值需要重新observe，保证数据的响应式
            childOb = !shallow && observe(newVal)
            // 通知所有的观察者
            dep.notify()
        }
    })
}
```
其中getter方法：

1. 先为每个data声明一个dep实例对象，被用于getter时执行dep.depend()进行收集相关的依赖
1. 根据Dep.target来判断是否收集依赖，还是取普通值。简单理解就是在实际页面中用到的data数据打上标记，并标记为Dep.target

在setter方法：

1. 获取新的值进行observe，保证数据响应式
1. 通过dep对象通知所有观察者去更新数据，从而达到响应式效果

在Observer类中，我们可以看到在getter时，dep会收集相关依赖，即收集依赖的watcher，然后在setter操作时候通过dep去通知watcher，此时watcher就执行变化，其实我们可以简单理解：Dep可以看作书店，Watcher就是订阅者，而Observer就是书，订阅者在书店订阅书籍，就可以添加订阅者信息，一旦有新书就会通过书店给订阅者发布消息
## Watcher
watcher是一个观察者对象。依赖收集以后watcher对象会被保存在Dep的subs中，数据变动的时候Dep会通知watcher实例，然后由watcher实例回调cb进行试图更新。
> src/core/observer/watcher.js

```javascript
// 解析表达式，进行依赖收集的观察者，同时在表达式数据变更时触发回调函数
// 被用于$watch api以及指令
export default class Watcher {
    vm: Component;
    expression: string;
    cb: Function;
    id: number;
    deep: boolean;
    user: boolean;
    lazy: boolean;
    sync: boolean;
    dirty: boolean;
    active: boolean;
    deps: Array<Dep>;
    newDeps: Array<Dep>;
    depIds: SimpleSet;
    newDepIds: SimpleSet;
    before: ?Function;
    getter: Function;
    value: any;

    constructor (
        vm: Component,
        expOrFn: string | Function,
        cb: Function,
        options?: ?Object,
        isRenderWatcher?: boolean
    ) {
        this.vm = vm
        if (isRenderWatcher) {
            vm._watcher = this
        }
		
        // 存放订阅者实例
        vm._watchers.push(this)
        // options
        if (options) {
            this.deep = !!options.deep
            this.user = !!options.user
            this.lazy = !!options.lazy
            this.sync = !!options.sync
            this.before = options.before
        } else {
            this.deep = this.user = this.lazy = this.sync = false
        }
        this.cb = cb
        this.id = ++uid // uid for batching
        this.active = true
        this.dirty = this.lazy // for lazy watchers
        this.deps = []
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()
        this.expression = process.env.NODE_ENV !== 'production'
            ? expOrFn.toString()
        : ''
        // parse expression for getter
        // 把表达式expOrFn解析为getter
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            this.getter = parsePath(expOrFn)
            if (!this.getter) {
                this.getter = noop
                process.env.NODE_ENV !== 'production' && warn(
                    `Failed watching path: "${expOrFn}" ` +
                    'Watcher only accepts simple dot-delimited paths. ' +
                    'For full control, use a function instead.',
                    vm
                )
            }
        }
        this.value = this.lazy
            ? undefined
        : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
	// 获得getter的值并重新进行依赖收集
    get () {
        // 将自身watcher观察者实例设置给Dep.target，用于依赖收集
        pushTarget(this)
        let value
        const vm = this.vm
        
        /*
        	执行了getter操作，看似执行了渲染操作，其实是执行了依赖收集，
        	在将Dep.target设置为观察者实例后，执行getter操作。
        	假如data中有a,b,c三个数据，getter渲染需要依赖a和c，
        	那么在执行getter的时候就会触发a和c的getter函数，
        	在getter函数中即可判断Dep.target是否存在然后完成依赖收集，
        	将该观察者对象放入闭包的Dep的subs中
        */
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
            // 如果存在deep，则触发每个深层对象的依赖，追踪变化
            if (this.deep) {
                traverse(value)
            }
            // 将观察者实例从target取出 并设置给Dep.target
            popTarget()
            this.cleanupDeps()
        }
        return value
    }

  /**
   * Add a dependency to this directive.
   */
	// 添加一个依赖关系到Deps集合
    addDep (dep: Dep) {
        const id = dep.id
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    }

  /**
   * Clean up for dependency collection.
   */
	// 清理依赖收集
    cleanupDeps () {
        let i = this.deps.length
        while (i--) {
            const dep = this.deps[i]
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this)
            }
        }
        let tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
    }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
	// 调度者接口，当依赖发生改变的时候进行回调
    update () {
        /* istanbul ignore else */
        if (this.lazy) {
            this.dirty = true
        } else if (this.sync) {
            // 同步执行run直接渲染视图
            this.run()
        } else {
            // 异步推送到观察者队列，下一个tick调用
            queueWatcher(this)
        }
    }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
	// 调度者工作接口，将被调度者回调
    run () {
        if (this.active) {
            // get操作在获取value本身也会执行getter从而调用update更新视图
            const value = this.get()
            if (
                value !== this.value ||
                // Deep watchers and watchers on Object/Arrays should fire even
                // when the value is the same, because the value may
                // have mutated.
                // 即便值相同，拥有Deep属性的观察者以及在对象/数组上的观察者应该触发更新
                isObject(value) ||
                this.deep
            ) {
                // set new value
                // 设置新的值
                const oldValue = this.value
                this.value = value
                // 触发回调
                if (this.user) {
                    const info = `callback for watcher "${this.expression}"`
                    invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info)
                } else {
                    this.cb.call(this.vm, value, oldValue)
                }
            }
        }
    }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
	// 获取观察者的值
    evaluate () {
        this.value = this.get()
        this.dirty = false
    }

  /**
   * Depend on all deps collected by this watcher.
   */
	// 收集该watcher的所有deps依赖
    depend () {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }

  /**
   * Remove self from all dependencies' subscriber list.
   */
	// 将自身从所有依赖收集订阅列表删除
    teardown () {
        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            // 从vm实例的观察者列表中将自身移除，由于该操作比较耗费资源，所以如果vm实例正在被销毁则跳过该步骤
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this)
            }
            let i = this.deps.length
            while (i--) {
                this.deps[i].removeSub(this)
            }
            this.active = false
        }
    }
}
```
## Dep
其实是在defineReactive的时候进行实例化，通过getter进行依赖收集，setter进行依赖通知，而内部的subs则是每一个watcher对象。
```javascript
/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
id: number;
subs: Array<Watcher>;

constructor () {
  this.id = uid++
  this.subs = []
}

addSub (sub: Watcher) {
  this.subs.push(sub)
}

removeSub (sub: Watcher) {
  remove(this.subs, sub)
}

depend () {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}

notify () {
  // stabilize the subscriber list first
  const subs = this.subs.slice()
  if (process.env.NODE_ENV !== 'production' && !config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort((a, b) => a.id - b.id)
  }
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}

```
## 总结
首先将data传入到Observer转为getter/setter形式，当watcher实例读取数据的时候，会触发getter，被收集到dep仓库中，当数据更新是，触发setter，通知dep仓库中的watcher实例更新，watcher实例负责通知。
