# matirx 矩阵

```css
transform: matrix(a, b, c, d, e, f);
```

其对应的矩阵是：

```text
a c e
b d f
0 0 1
```

转换公式:

```text
a c e   x   ax + cy + e
b d f * y = bx + dy + f
0 0 1   1   0  + 0  + 1
```

`ax + cy + e`为变换后的水平坐标

`bx + dy + f`为变换后的垂直坐标

## 偏移

假设矩阵参数如下：

```css
transform: matrix(1, 0, 0, 1, 30, 30);
```

根据矩阵偏移元素的中心点，假设是(0, 0)，即x=0,y=0

那么变换后的x坐标就是`ax + cy + e = 1*0+0*0+30 = 30`，y坐标就是`bx + dy + f = 0*0+1*0+30 = 30`

于是，中心点坐标就变成了(0, 0) => (30, 30)

而实际上`transform: matrix(1, 0, 0, 1, 30, 30);`等同于`transform: translate(30px, 30px)`

## 缩放

假如设置`transform: matrix(1, 0, 0, 1, 0, 0)`会发现元素的比例和原来的一样，而1，其实就是缩放相关的参数

`matrix(sx, 0, 0, sy, 0, 0);`等同于`scale(sx, sy)`

## 旋转

假设角度为0

```css
matrix(cosθ, sinθ, -sinθ, cosθ, 0, 0)
```

结合矩阵公式：

```text
x' = x*cosθ-y*sinθ+0 = x*cosθ-y*sinθ
y' = x*sinθ+y*cosθ+0 = x*sinθ+y*cosθ
```

js计算：

```js
const value = 30; // 假设旋转30deg
const cosVal = Math.cos(value * Math.PI / 180)
const sinVal = Math.sin(value * Math.PI / 180);
const transform = 'matrix('+ cosVal.toFixed(6) +','+ sinVal.toFixed(6) +','+ (-1 * sinVal).toFixed(6) +','+ cosVal.toFixed(6) +',0,0)'
```

计算后的结果：

`transform: matrix(0.866025,0.500000,-0.500000,0.866025,0,0)`等同于`transform: rotate(30deg)`

## 拉伸

```css
matrix(1,tan(θy),tan(θx),1,0,0)
```

结合矩阵公式：

```text
x' = x+y*tan(θx)+0 = x+y*tan(θx) 
y' = x*tan(θy)+y+0 = x*tan(θy)+y
```

0x对应x轴倾斜，0y对应y轴倾斜

js计算：

```js
const xValue = 30;
const yValue = 30;
const tanValY = Math.tan(xValue * Math.PI / 180);
const tanValX = Math.tan(yValue * Math.PI / 180);
const transform = 'matrix(1,'+ tanValY.toFixed(6) +','+ tanValX.toFixed(6) +',1,0,0)';
```

计算后的结果：

`matrix(1,0.577350,0.577350,1,0,0)`等同于`transform:skew(30deg,30deg)`