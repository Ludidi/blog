# wxs 探索

## 背景:

正常情况下，通过事件驱动的交互在小程序上面是比较卡顿的。
先通过事件触发从视图层(webview)抛到逻辑层(App Service)，然后再从逻辑层处理事件，最终通过 setData 来改变。
一次事件响应需要经过 2 次的逻辑层和渲染成的通讯以及一次渲染，通信耗时比较大，此外，setData 渲染也会阻塞
其他脚本执行，导致了整个用户交互的动画过程会有延迟。

## wxs 的好处：

主要是减少通信次数，让事件在视图层(webview)响应。
wxs 函数：

1. 纯逻辑运算 （不支持自定义组件事件，只能响应内置组件事件）
2. 可以通过封装好的 ComonentDescriptor 实例来访问以及设置组件的 class 和样式。

用法:
原生：

```xml
<wxs module="computed" src="./xxx"></wxs>
<view :style="computed.style({ display })"></view>
```

uni: 注：[不支持 classObject 和 styleObject](https://uniapp.dcloud.io/use?id=class-%e4%b8%8e-style-%e7%bb%91%e5%ae%9a)
但是可以用 computed 方法生成 class 或者 style 字符串，插入到页面中

```vue
<view @click="computed.style"></view>
<script lang="wxs" module="computed"></script>
```

用法上很 vue 的计算属性，但其实是将同意函数定义为一个方法，例如 vue 里面的 methods，每当触发重新渲染时，调用方法将总会再次执行函数。

## 使用场景：

常用作于交互动画

注意事项：

1. wxs 有自己的语法，具体详见小程序文档，大部分语法是 ES5 标准
2. wxs 的运行环境和其他 js 代码是隔离的，wxs 不能调用其他 js 文件中的函数，也不能调用小程序提供的 api
3. wxs 函数不能作为组件的事件回调

例子：

```js
// array.wxs:
function isArray(array) {
  return array && array.constructor === 'Array';
}

module.exports.isArray = isArray;
```

```js
// object.wxs:
var REGEXP = getRegExp('{|}|"', 'g');

function keys(obj) {
  return JSON.stringify(obj)
    .replace(REGEXP, '')
    .split(',')
    .map(function (item) {
      return item.split(':')[0];
    });
}

module.exports.keys = keys;
```

```js
// style.wxs
var object = require('./object.wxs');
var array = require('./array.wxs');

function style(styles) {
  if (array.isArray(styles)) {
    return styles
      .filter(function (item) {
        return item != null && item !== '';
      })
      .map(function (item) {
        return style(item);
      })
      .join(';');
  }

  if ('Object' === styles.constructor) {
    return object
      .keys(styles)
      .filter(function (key) {
        return styles[key] != null && styles[key] !== '';
      })
      .map(function (key) {
        return [key, [styles[key]]].join(':');
      })
      .join(';');
  }

  return styles;
}

module.exports = style;
```

<Gitalk />
