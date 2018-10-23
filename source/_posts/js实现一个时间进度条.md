---
title: js实现一个时间进度条
date: 2017-12-08 14:17:42
tags:
---

## 需求  

分段 时间 进度条，标记进度具体位置。（分多少段不固定，可能是一段 两段 三段）
![图片](/images/2017-12-08/Y}BZV53IA][@U6FVA{(GN`6.png)
每段宽度相同  但每段时间间隔可能不同   标记进度点的位置  并当前时间段数字高亮

### 实现方法
样式就不粘代码了，简单说下

是一个小程序项目，所以用的flex布局，进度条是背景色渐变。

``` js
// 返回进度条百分比 和 当前位置所在时间段
// 参数都为 number 类型   最后一个参数为进度所在点
const progressThan = (...arg) => {
	const len = arg.length
	let progressThan = 0, activeIndex = len
	const stamp = arg.pop()
	arg.push(null)
	for (let i = 0; i < len; i++) {
		if (!arg[i + 1]) break
		if (arg[i + 2]) continue
		for (let index = 0; index < len; index++) {
			if (stamp < arg[index + 1]) {
				progressThan = ((index) / (i + 1)) + ((stamp - arg[index]) / (arg[index + 1] - arg[index]) / (i + 1))
				if ((progressThan > 0) && (progressThan < 1)) activeIndex = index
				break
			}
			progressThan = 1
		}
	}
	return { progressThan, activeIndex }
}
```
