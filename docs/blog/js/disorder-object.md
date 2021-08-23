# 无序对象

[[toc]]

常规情况下，使用对象时会获取某个对象指定键下的值，但当遍历或者打印输出的时候会发现对象是无序的，并不是按照添加的顺序输出，为什么会出现这种问题，本篇则利用`Object.keys()`方法深入到 ECMA 规范中去了解。

## 示例

先来看一下示例：

```js
const obj = { a: 1, c: 2, b: 3, 2: 4, 1: 5 };
console.log(Object.keys(obj)); // ["1", "2", "a", "c", "b"]
```

似乎 js 引擎做了一些默认处理：

1. 提取了 2 和 1，做了升序排序
2. 剩下的 a、c、b 按照先后顺序排序

## 规范

[查看规范](https://tc39.es/ecma262/)，搜索`Object.keys()`获取其详细定义

![1-1](/images/js/disorder-object-1-1.png)

## 解读 Object.keys()

当使用参数 O 时调用 keys 函数，则会有以下三个步骤：

1. Let obj be ? ToObject(O).

相当于`let obj = ToObject(O)`。定义一个 obj 遍历，执行 ToObject(O)这个函数，而`O`就是传入到`Object.keys()`里面的这个参数。

> 点击 ToObject 可以看到如下定义:

![1-2](/images/js/disorder-object-1-2.png)

由此可见，参数类型如果是 undefined 或者 null 时，会导致类型错误，可以简单测试一下:

```js
console.log(Object.keys(undefined));
// Uncaught TypeError: Cannot convert undefined or null to object
```

果然如此，然后看最后一行，如果里面传入一个对象，则就会返回传入的这个参数

2. Let nameList be ? EnumerableOwnPropertyNames(obj, key).

然后又定义一个 nameList，其值为`EnumerableOwnPropertyNames(obj, key)`返回的结果。这里需要注意的第一个参数`obj`是由第一步`ToObject`返回的`obj`，第二个参数`key`就是个字面量，其值就是`key`。

查看`EnumerableOwnPropertyNames`的定义，从字面上可以获知他是可以得到可枚举自身属性的键，然后我们来详细点进去看一下：

![1-3](/images/js/disorder-object-1-3.png)

抽象操作`EnumerableOwnPropertyNames`接受参数`O`(传入的 Object)和`kind`(键、值或者键和值)，它在被调用时执行以下步骤：

- 断言类型`O`是`object`
- 定义变量`ownKeys`是`O.[[OwnPropertyKeys]]()`返回的结果 _（`[[OwnPropertyKeys]]`为 js 的内部方法，只能 js 引擎调用，不能 js 调用）_
- 创建一个`properties`为空列表`empty list`
- 遍历`ownKeys`列表，取得每一个`key`:
  - 如果`typeOf key`为`String`，则：
    - 定义变量`desc`为`O.[[GetOwnProperty]](key)`的返回值，desc 为描述对象
    - 如果`desc`不是`undefined`，且`desc`的`[[Enumerable]]`可枚举值为`true`，则：
      - 如果`kind`是`key`，则添加`key`到`properties`
      - 否则
        - 定义`value`为`Get(O, key)`的值
        - 如果`kind`为`value`，则添加`value`到`properties`
        - 否则
          - 断言`kind`是`key + value`
          - 定义`entry`为`CreateArrayFromList(<<key, value>>)`
          - 添加`entry`到`properties`
- 最后`return properties`

由于入参`kind`类型为`key`，则根据以上逻辑将符合条件的`ownKeys`的值添加到`properties`列表中，最终得到了`nameList`

3. Return CreateArrayFromList(nameList).

最后一步比较简单，将`nameList`转为`array`，最终`return array`就结束了。可是看到这里发现，好像没有对 key 做排序处理，到底是哪一步做了特殊的处理了？再回过头详细看一下，发现第二步里面获取`ownKeys`时，忽略了`[[OwnPropertyKeys]]`这个内置方法，让我们再来详细看下这个规范

4. [[OwnPropertyKeys]]

## 思考

## 如何顺序执行

## 拓展-检查对象上是否存在属性

## References

https://zhuanlan.zhihu.com/p/389201653
