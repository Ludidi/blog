# 渐弱页面

渐弱具体是指用户修改了系统的设置，将动画最小化，最好将不必要的动画都移除掉。那么在浏览器里面的表现其实和系统应用保持一致。可以借助于媒体查询`prefers-reduced-motion
`实现。

## prefers-reduced-motion
主要是用于检测用户是否被开启了动画渐弱功能，详见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-reduced-motion)

解决方案：
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
} ​​​
```