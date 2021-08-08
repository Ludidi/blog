---
editLinkPattern: false
contributors: false
---

# BFC

BFC 是用于决定块盒子的布局及浮动相互影响范围的一个区域

## 创建 BFC:

1. 根元素 `<html></html>`
2. 浮动 (元素的 float 不为 none)
3. 绝对定位元素 (元素的 position 为 absolute 或 fixed)
4. 行内块 inline-block (display: inline-block)
5. 表格单元格 (dsiplay: table-cell)
6. overflow 不为 visible
7. 弹性盒 (dsiplay: flex 或 inline-flex)
   常用创建 BFC 的方法：overflow:hidden、float:left/right、position:absolute

### BFC 的范围：

一个 BFC 包含创建该上下文的所有子元素，但不包括创建了新 BFC 的子元素和内部元素
可以理解为一个元素不能同时存在 2 个 BFC 中
BFC
element
BFC
element (不受第一个 BFC 影响，只包含在第二个 BFC 里面)

### BFC 的效果：

建立一个隔离的空间，断绝空间内外元素间相互的作用

1. 内部的盒子会在垂直方向一个接一个排列 BFC 中有一个常规流
2. 处于同一个 BFC 中的元素会互相影响，可能会发生 margin 塌陷
3. 每个元素的 margin box 的左边，与容器块 border box 的左边相接触(对于从左往右的格式化)
4. BFC 是页面上一个隔离的独立容器，容器里面的子元素不会影响到外面的元素，反之亦然
5. 计算 BFC 高度时，考虑 BFC 所包含的所有元素，连浮动元素也参与计算
6. 浮动盒区域不叠加到 BFC 上

<Gitalk />
