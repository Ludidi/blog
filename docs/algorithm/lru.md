# LRU 缓存淘汰算法

LRU(Least Recently Used)是一种缓存淘汰策略。因为在浏览器中缓存的容量有限，缓存的结果都会存放在浏览器的内存里面，如果缓存满的就要删除一些内容，而把有用的数据继续留在缓存里面，方便之后的使用。

> 在 vue 里面实际的使用场景为 keep-alive
>
> https://github.com/vuejs/vue/blob/dev/src/core/components/keep-alive.js#L30

假如以链表的方式来表达：

1 => 2 => 3 => 4

假设这个数据的长度为 4，且最大缓存数量为 4 的情况下

- `新增`5，就要把前面的干掉，保证最大缓存数量：

​ 2 => 3 => 4 => 5

- `新增已存在的`3，则先查找到 3，把 3 干掉，再新增 3

  2 => 4 => 5

  2 => 4 => 5 => 3

- 读取已存在的(读取 2)，则先获取已存在的 value 值，并返回该 value，再把当前的 key 干掉，再新增

  4 => 5 => 3

  4 => 5 => 3 => 2

- 读取不存在的，则直接返回**-1**即可

```js
var LRUCache = function (capacity) {
  this.cache = new Map();
  this.max = capacity;
};

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function (key) {
  if (this.cache.has(key)) {
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  return -1;
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function (key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  } else if (this.cache.size >= this.max) {
    this.cache.delete(this.cache.keys().next().value);
  }
  this.cache.set(key, value);
};
```
