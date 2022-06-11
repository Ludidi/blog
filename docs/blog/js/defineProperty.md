# Object.defineProperty

> vue2.0是根据defineProperty方法实现响应式的，那么本篇则利用vue响应式的角度来理解defineProperty

## 语法

Object.defineProperty(obj,prop,descriptor)

参数

* `obj`：要定义属性的对象
* `prop`：要定义或修改的属性名称或Symbol
* `descriptor`：要定义或修改属性描述符

## 响应式数据

直接贴完整示例的代码

```js
const render = (...args) => {
    console.log('render ==>', args);
};

// 数组 START
const arrayProto = Array.prototype; // 保存数组原型
const arrayMethods = Object.create(arrayProto); // 创建新的数组原型
const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
methodsToPatch.forEach((method) => {
    arrayMethods[method] = function () {
        // 对数组方法重写
        arrayProto[method].call(this, ...arguments);
        render(...this);
    };
});
// 数组 END
		
// 封装响应式
const defineReactive = (obj, key, val) => {
    Object.defineProperty(obj, key, {
        get() {
            return val;
        },
        set(newVal) {
            if (val === newVal) {
                return;
            }

            val = newVal;
            render(key, newVal);
        },
    });
};

const reactive = (obj) => {
    for (const key in obj) {
        if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
            // 深度嵌套 考虑对象嵌套
            reactive(obj[key]);
        } else if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
            // 数组重写
            obj[key].__proto__ = arrayMethods;
        } else {
            defineReactive(obj, key, obj[key]);
        }
    }
};

// 模拟vue的$set
function set(obj, key, val) {
    defineReactive(obj, key, val);
    obj[key] = val;
    render(key, val);
}

const data = {
    a: 1,
    b: 2,
    c: 3,
    d: {
        d1: 1,
        d2: 2,
    },
    arr: [3, 1, 2],
};
reactive(data);

data.b = 1;
data.d.d1 = 3;
data.arr.push(2);

set(data, 'test', 1);

console.log(data);

// 打印结果为
// render ==> (2) ['b', 1]
// render ==> (2) ['d1', 3]
// render ==> (4) [3, 1, 2, 2]
// render ==> (2) ['test', 1]
// {d: {…}, arr: Array(4), …}
```



需要注意的是：

* defineProperty代理的是对象中的某个属性，所以需要遍历进行遍历代理

* 对于对象嵌套需要考虑对象嵌套的问题，采用递归进行添加响应式

* 而对于数组则需要对数组操作的方法进行重写，并重新调用render

其实在vue内部：

* get方法会调用dep.depend()进行收集依赖

* set时调用dep.notify()来进行update操作

## 参考

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

https://juejin.cn/post/6994330536239955981#heading-0

