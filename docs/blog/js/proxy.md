# Proxy

> vue3则是采用proxy实现的数据代理

## 语法

new Proxy(target, handler)

参数

* `target`：要使用Proxy包装的目标对象(可以是任何类型的对象，包括原生数组，函数甚至另一个代理)
* `handler`：一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理实例对象的行为

## 响应式数据

直接贴完整示例的代码

```js
const render = () => {
    console.log('render');
};

const handler = {
    get(target, property) {
        const value = target[property];
        if (value !== null && typeof value === 'object') {
            return new Proxy(value, handler); // 代理深层
        }
        return target[property];
    },
    set(target, property, value) {
        console.log('set ==> ', target, property, value);
        target[property] = value;
        render();
        return Reflect.set(...arguments); // 允许在对象上设置属性，成功则返回true
    },
    deleteProperty(target, property) {
        console.log('deleteProperty', target, property);
        delete target[property];
        render();
        return true;
    },
};

/**
* 测试对象
*/
const object = {
    a: 1,
    b: {
        c: 2,
        d: {
            e: 3,
        },
    },
};

const obj = new Proxy(object, handler);
obj.a;
obj.b.d.e;
obj.b.d.e = 5; // 需要代理深层
delete obj.b.d.e; // deleteProperty
/**
* 打印结果为
* set ==>  {e: 3} e 5
* render
* deleteProperty {e: 5} e
* render
*/


/**
* 测试数组
*/
const array = [1, 2, 3, { a: 4 }];
const arr = new Proxy(array, handler);
arr[4] = { a: 1 };
arr[4].a = 2;
delete arr[4];
/**
* 打印结果为
* set ==>  (4) [1, 2, 3, {…}] 4 {a: 1}
* render
* set ==>  {a: 1} a 2
* render
* deleteProperty (5) [1, 2, 3, {…}, {…}] 4
* render
*/
```

需要注意的：

* set里面需要返回true代表属性设置成功，否则在严格模式下，如果返回一个false，会抛出一个异常

## 区别

* proxy是对整个对象的代理，而defineProperty只能代理某个属性
* 对象上新增属性，proxy可以监听到，而defineProperty不能，所以在vue里面会有set方法
* 数组新增修改，proxy可以监听到，defineProperty不能
* 若对象内部属性需要全部递归代理，proxy可以只在调用的时候进行递归，而defineProperty需要一次完成所有递归，这点上性能比proxy差
* proxy不兼容IE，definProperty不兼容IE8及以下
* proxy使用上要比defineProperty方便

## 参考

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

https://juejin.cn/post/6994330536239955981#heading-1

