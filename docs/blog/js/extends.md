# 继承

## 原型链继承

```js
function Person(a) {
  this.a = a;
}

function Son (a, b) {
  Person.call(this, a);
  this.b = b;
}

Son.proptotype = new Person(); // 导致的问题，Person会多一次调用，浪费时间和空间
Son.proptotype.constructor = Son; // 需挂在constructor指向自身
```

## 组合式继承

> 解决原型链继承带来的问题

```js
function Person(a) {
  this.a = a;
}

function Son (a, b) {
  Person.call(this, a);
  this.b = b;
}

function Midden() {} // 由于midden里面没有参数，所以所占用的空间和时间是极少的
Midden.proptotype = Person.prototype;
// 寄生新创建的构造函数 Son.proptotype.__proto__ === Person.prototype
Son.proptotype = new Midden();
Son.proptotype.constructor = Son;

const son = new Son(1, 2);
son.a; // 1
```

优化prototype赋值，提取变量

```js
function _extends(parent, son) {
  function Midden() {
    this.constructor = son;
  }
  Midden.prototype = parent.prototype;
  return new Midden();
}
Son.prototype = _extends(Person, Son);
```

也可以采用Object.create实现

```js
function _extends(parent) {
  return Object.create(parent.prototype);
}
Son.prototype = _extends(Person);
Son.prototype.constructor = Son;
```

