# 重载

[[toc]]

## 函数重载

在 vue3 源码中，经常可以见到泛型函数重载

```ts
export function ref<T extends object>(value: T): ToRef<T>;
export function ref<T>(value: T): Ref<UnwrapRef<T>>;
export function ref<T = any>(): Ref<T | undefined>;
export function ref(value?: unknown) {
  return createRef(value, false);
}
```

### 定义

> 一组具有相同名字，不同参数列表的和返回值无关的函数，由以下规则组成的一组函数

### 函数签名

​ 函数签名 = 函数名称 + 函数参数 + 函数参数类型 + 函数返回值类型。不包括函数体。在 TS 函数重载中，包含了实现签名和重载签名，实现签名时一种函数签名，重载签名也是一种函数签名。

> 靠近函数体的为实现签名。没有函数体的为重载签名。

### 重载规则

- 由一个实现签名 + 一个或多个重载签名合成。
- 外部调用函数重载定义的函数时，只能调用重载签名，不能调用实现签名。重载签名没有函数体，实现签名的函数体是定义给重载函数使用的，使用权归于重载签名。实现签名是统领所有重载签名的，不能被调用。
- 调用重载函数的签名时，会根据传递的参数来判断你调用的是哪一个函数。
- 只有一个函数体，只有实现签名配备了函数体，所有的重载签名只有签名，没有配备函数体
- 实现签名参数可以少于重载签名的参数个数，但实现签名如果准备包含重载签名的某个位置的参数，那实现签名就必须兼容所有重载签名该位置的参数类型(联合类型 any 或者 unknown 类型的一种)

## 方法重载

> 方法是一种在特定场景下的函数，由对象变了【实例变量】直接调用的函数都是方法。

1. 函数内部用 this 定义的函数是方法
2. ts 类中定义的函数是方法(ts 编译后 js 底层 prototype 的一个函数)
3. 接口内部定义的函数是方法
4. type 内部定义的函数是方法

### 方法签名

方法签名 = 方法名称 + 方法参数 + 方法参数类型 + 返回值类型。

## 构造器重载

### 构造器重载的意义

构造器重载和函数重载基本相同，主要区别是：ts 类构造器重载签名和实现签名都不需要管理返回值，ts 构造器是在对象创建出来之后，但是还没有赋值给对象变量之前被执行，一般涌来给对象属性赋值。
