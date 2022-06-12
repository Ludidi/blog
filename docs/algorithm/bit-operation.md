# 位运算

`<< >> & | ^`，二进制位置上的运算

### <<

向左移动几位，移掉的省略，右边缺失的位用 0 补齐

```js
1 << 1; // 2
1 << 2; // 4
```

### >>

向右移动几位，移掉的省略，左边缺失的位，如果是正数则用 0 补齐，如果是负数用 1 补齐

```js
8 >> 1; // 4
8 >> 2; // 2
9 >> 2; // 2
```

### &

两个同时是 1 的时候，结果是 1，否则是 0

```js
011 & 001; // 001 => 1
```

### ｜

两个同时是 0 的时候，结果是 0，否则是 1

```js
// 伪代码 二进制
010 | 100; // 110 => 6
```

### ^

异或运算，两个数字不同，结果是 1，否则是 0

```js
10 ^ 01; // 11 => 3
100 ^ 010; // 110 => 6
```

## 位运算的运用

在 vue 源码或者 react 源码中均有体现

```js
let STYLE = 1;
let CLASS = 1 << 1;
let CHILDREN = 1 << 2;

// 授权
let vnodeType = STYLE | CLASS;
console.log('STYLE', !!(vnodeType & STYLE)); // true
console.log('CLASS', !!(vnodeType & CLASS)); // true
console.log('CHILDREN', !!(vnodeType & CHILDREN)); // false

// 删除授权
vnodeType = vnodeType ^ CLASS;
console.log('STYLE', !!(vnodeType & STYLE)); // true
console.log('CLASS', !!(vnodeType & CLASS)); // false
console.log('CHILDREN', !!(vnodeType & CHILDREN)); // false
```
