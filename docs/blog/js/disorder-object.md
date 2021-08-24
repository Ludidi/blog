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

### 1. Let obj be ? ToObject(O).

相当于`let obj = ToObject(O)`。定义一个 obj 遍历，执行 ToObject(O)这个函数，而`O`就是传入到`Object.keys()`里面的这个参数。

> 点击 ToObject 可以看到如下定义:

![1-2](/images/js/disorder-object-1-2.png)

由此可见，参数类型如果是 undefined 或者 null 时，会导致类型错误，可以简单测试一下:

```js
console.log(Object.keys(undefined));
// Uncaught TypeError: Cannot convert undefined or null to object
```

果然如此，然后看最后一行，如果里面传入一个对象，则就会返回传入的这个参数

### 2. Let nameList be ? EnumerableOwnPropertyNames(obj, key).

然后又定义一个 nameList，其值为`EnumerableOwnPropertyNames(obj, key)`返回的结果。这里需要注意的第一个参数`obj`是由第一步`ToObject`返回的`obj`，第二个参数`key`就是个字面量，其值就是`key`。

查看`EnumerableOwnPropertyNames`的定义，从字面上可以获知他是可以得到可枚举自身属性的键，然后我们来详细点进去看一下：

![1-3](/images/js/disorder-object-1-3.png)

抽象操作`EnumerableOwnPropertyNames`接受参数`O`(传入的 Object)和`kind`(键、值或者键和值)，它在被调用时执行以下步骤：

- 断言类型`O`是`object`
- 定义变量`ownKeys`是`O.[[OwnPropertyKeys]]()`返回的结果 _（`[[OwnPropertyKeys]]`为 js 的内部方法，只能 js 引擎调用，不能 js 调用）_
- 创建一个`properties`为空列表`empty list`
- 遍历`ownKeys`列表，取得每一个`key`:
  - 如果`Type(key)`为`String`，则：
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

### 3. Return CreateArrayFromList(nameList).

最后一步比较简单，将`nameList`转为`array`，最终`return array`就结束了。可是看到这里发现，好像没有对 key 做排序处理，到底是哪一步做了特殊的处理了？再回过头详细看一下，发现第二步里面获取`ownKeys`时，忽略了`[[OwnPropertyKeys]]`这个内置方法，让我们再来详细看下这个规范

#### [[OwnPropertyKeys]]

![1-4](/images/js/disorder-object-1-4.png)

在这个方法里面，`[[OwnPropertyKeys]]`是不带参数的，于是执行下面这个方法`[[OrdinaryOwnPropertyKeys(O)]]`，里面执行的过程，让我们来详细解读一下：

- 定义`keys`为一个空的`list`
- 遍历对象`O`取得每一个键`P`，如果`P`符合`array index`定义的属性，则进行升序排序，执行:
  - 把`P`添加到`keys`里面
- 遍历对象`O`取得每一个键`P`，如果`P`的类型`Type(P)`是`String`并且`P`不是`array index`，则按照属性创建的时间的顺序升序，执行：
  - 把`P`添加到`keys`里面
- 遍历对象`O`取得每一个键`P`，如果`p`的类型`Type(P)`是`Symbol`，则按照属性创建的时间的顺序升序，执行：
  - 把`P`添加到`keys`里面
- 最后`return keys`

到了这一步，找到了问题的答案，正是`[[OwnPropertyKeys]]`中对原始对象做了分类和排序，所以不论`array index`在对象里面如何去定义，最终都会得到以`array index`升序后的对象，然后再对其键的类型进行分类`array index => string => Symbol`。

#### array index

这里的`array index`并不是我们所理解的数组索引，其实是整数索引，看下官方的描述:

> An array index is an integer index whose numeric value i is in the range +0𝔽 ≤ i < 𝔽(2<sup>32</sup> - 1).

这个`i`是有范围的`0 <= i <= 2**32 - 1`，我们可以来测试一下：

```js
const obj = { a: 1, c: 2, b: 3, 2: 4, 1: 5 };
const s = Symbol('s');
obj[s] = 6;
obj[-1] = 7;
obj[2 ** 32 - 1] = 8;
obj[2 ** 32 - 2] = 9;

console.log(Object.keys(obj)); // ["1", "2", "4294967294", "a", "c", "b", "-1", "4294967295"]
```

来看下打印得结果`["1", "2", "4294967294", "a", "c", "b", "-1", "4294967295"]`，可能会有疑问为什么没有`Symbol`，因为`Object.keys()`返回的是可枚举的键属性(不包含 Symbol 属性的键名)。

## 思考

详细阅读了其规范，发现我们需要换个角度来理解 js 这门语言，文档里面有很多内置方法，虽然不太好理解，但大多数可以根据字面的意思来理解这个方法是作用于什么的，倒也算是换了一种思考问题的方式。不过从阅读规范来看，使得我们可以往下钻研其内部原理或逻辑，可以更深入的挖掘他为什么要这样做，这样的好处有哪些。

## References

https://zhuanlan.zhihu.com/p/389201653

<Gitalk />
