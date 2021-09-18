# type 与 interface

[[toc]]

最近在用 ts 重构项目，重新学习一下 ts 语法，但是会有一个疑问，到底什么时候可以用 type 什么时候用 interface，这篇文章就详细的对比一下两者的区别，到底在哪个场景下用哪个。

## 定义

先从用法上来看：

### 对象/函数

type

```ts
type X = {
  a: string;
  b: string;
};

type SetX = (a: string) => void;
```

interface

```ts
interface X {
  a: string;
  b: string;
}

interface SetX = {
  (a: string): void;
}
```

### Extend

type

```ts
type Animal = {
  name: string;
};

type Bear = Animal & {
  honey: boolean;
};
```

interface

```ts
interface Animal {
  name: string;
}

interface Bear extends Animal {
  boney: boolean;
}
```

### Implements

type

```ts
type Point = {
  x: number;
  y: number;
};

class SomePoint implements Point {
  x = 1;
  y = 2;
}
```

interface

```ts
interface Point {
  x: number;
  y: number;
}

class SomePoint implements Point {
  x = 1;
  y = 2;
}
```

**类只能实现对象类型或者具有静态已知成员的对象类型的交集**，看下面这个例子

```ts{3}
type Point = { x: number } | { y: number };

class SomePoint implements Point { // Point 报错，因为Point不是静态已知成员
  x = 1;
  y = 2;
}
```

### 重复定义

type

```ts{1,5}
type Point = { // error 重复定义 'Point'.
  x: string;
};

type Point = { // error 重复定义 'Point'.
  y: string;
};
```

interface

```ts
interface Point {
  x: string;
}

interface Point {
  y: string;
}

const point: Point = {
  x: '1',
  y: '2',
};
```

**可以看出 interface 是可以被定义多次，并会被视为单个接口，所有声明的成员被合并**

### 其他类型

与 interface 不同的是，type 可以定义其他类型，如原始数据类型，对象，联合类型，元组。

```ts
type Name = string;

type PointObj = {
  x: string;
};

type Point = { a: number } | { b: number };

type Data = [number, string];
```

interface

```ts
interface Point = {
  x: string;
};

interface X extends string { // error string 不能重命名，这里的string其实指的是类型，但在这里用作为值
}
```

## 区别

可以获知以下区别：

- type 不能参与类型合并，但是 interface 可以
- interface 只能声明对象，不能重命名基础类型

## 如何选择

大部分情况下两者还是有很多相似的，差别最为明显的可能就是在用到联合类型的情况下使用 type，而 interface 更适合声明对象然后进行 implements 或 extends。所以**尽量使用 interface 来声明类型，直到需要 type**。

## References

[https://stackoverflow.com/questions/37233735/interfaces-vs-types-in-typescript](https://stackoverflow.com/questions/37233735/interfaces-vs-types-in-typescript)

[https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)

[https://github.com/typescript-cheatsheets/react#types-or-interfaces](https://github.com/typescript-cheatsheets/react#types-or-interfaces)

<Gitalk />
