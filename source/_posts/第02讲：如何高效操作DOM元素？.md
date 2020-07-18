---
title: 如何高效操作DOM元素？
date: 2020-07-18 20:39:27
tags:
---

#### 什么是 DOM
DOM（Document Object Model，文档对象模型）是 JavaScript 操作 HTML 的接口（这里只讨论属于前端范畴的 HTML DOM）

##### 借助DOM实现比如
- 动态渲染列表、表格表单数据；
- 监听点击、提交事件；
- 懒加载一些脚本或样式文件；
- 实现动态展开树组件，表单组件级联等这类复杂的操作。

#### DOM V3 标准 归纳起来常用的主要由 3 个部分组成
- DOM 节点
    - 概念： 节点是 DOM 树的基本单位，有多种类型，比如注释节点、文本节点；
    - 与标签区别： 标签是 HTML 的基本单位，比如 p、div、input（不是节点，与元素节点对应）；
    - 与元素区别： 元素是节点中的一种，与 HTML 标签相对应，比如 p 标签会对应 p 元素。


- DOM 事件
    - 下一节


- 选择区域
    - 选择区域的使用场景有限，一般用于富文本编辑类业务


举例说明，在下面的代码中，“p” 是标签， 生成 DOM 树的时候会产生两个节点，一个是元素节点 p，另一个是字符串为“亚里士朱德”的文本节点。
``` html
<p>亚里士朱德</p>
```

#### 为什么说 DOM 操作耗时
- [浏览器的工作机制 线程切换](#1)
- [重新渲染 重排、重绘](#2)

##### <a name="1">浏览器的工作机制 线程切换</a>
浏览器包含渲染引擎（也称浏览器内核）和 JavaScript 引擎，它们都是单线程运行。单线程的优势是开发方便，避免多线程下的死锁、竞争等问题，劣势是失去了并发能力。

浏览器为了避免两个引擎同时修改页面而造成渲染结果不一致的情况，增加了另外一个机制，这两个引擎具有互斥性，也就是说在某个时刻只有一个引擎在运行，另一个引擎会被阻塞。操作系统在进行线程切换的时候需要保存上一个线程执行时的状态信息并读取下一个线程的状态信息，俗称上下文切换。而这个操作相对而言是比较耗时的。

每次 DOM 操作就会引发线程的上下文切换——从 JavaScript 引擎切换到渲染引擎执行对应操作，然后再切换回 JavaScript 引擎继续执行，这就带来了性能损耗。单次切换消耗的时间是非常少的，但是如果频繁地大量切换，那么就会产生性能问题。

比如下面的测试代码，循环读取一百万次 DOM 中的 body 元素的耗时是读取 JSON 对象耗时的 10 倍。
``` js
// 测试次数：一百万次
const times = 1000000
// 缓存body元素
console.time('object')
let body = document.body
// 循环赋值对象作为对照参考
for(let i=0;i<times;i++) {
  let tmp = body
}
console.timeEnd('object')// object: 1.77197265625ms

console.time('dom')
// 循环读取body元素引发线程切换
for(let i=0;i<times;i++) {
  let tmp = document.body
}
console.timeEnd('dom')// dom: 18.302001953125ms
```

##### <a name="2">重新渲染</a>

元素及样式变化引起的再次渲染，在渲染过程中最耗时的两个步骤为重排（Reflow）与重绘（Repaint）。

浏览器在渲染页面时会将 HTML 和 CSS 分别解析成 DOM 树和 CSSOM 树，然后合并进行排布，再绘制成我们可见的页面。如果在操作 DOM 时涉及到元素、样式的修改，就会引起渲染引擎重新计算样式生成 CSSOM 树，同时还有可能触发对元素的重新排布（简称“重排”）和重新绘制（简称“重绘”）。

- 重排
    - 修改元素边距、大小
    - 添加、删除元素
    - 改变窗口大小
- 重绘
    - 设置背景图片
    - 修改字体颜色
    - 改变visibility属性值

*重排会导致重绘*

#### 如何高效操作 DOM
- [在循环外操作元素](#在循环外操作元素)
- [批量操作元素](#批量操作元素)
- [缓存元素集合](#缓存元素集合)

##### <a id="在循环外操作元素">在循环外操作元素</a>
``` js
const times = 10000;
console.time('switch')
for (let i = 0; i < times; i++) {
  document.body === 1 ? console.log(1) : void 0;
}
console.timeEnd('switch') // 1.873046875ms
var body = JSON.stringify(document.body)
console.time('batch')
for (let i = 0; i < times; i++) {
  body === 1 ? console.log(1) : void 0;
}
console.timeEnd('batch') // 0.846923828125ms
```
当然即使在循环外也要尽量减少操作元素，因为不知道他人调用你的代码时是否处于循环中。

##### <a id="批量操作元素">批量操作元素</a>
- [批量创建元素](#批量创建元素)
- [批量修改元素属性样式](#批量修改元素属性样式)

###### <a id="批量创建元素">批量创建元素</a>

先将 1 万个 div 元素的 html 字符串拼接成一个完整字符串，然后赋值给 body 元素的 innerHTML 属性就可以明显减少耗时。

``` html
<!-- markdown 神奇的操作，在这里直接用 js怎么也渲染不出来，只好改用html script标签 -->
<script>
const times = 10000
console.time('createElement')
for (let i = 0; i < times; i++) {
  const div = document.createElement('div')
  document.body.appendChild(div)
}
console.timeEnd('createElement') // 54.964111328125ms
console.time('innerHTML')
let html=''
for (let i = 0; i < times; i++) {
  html+='<div></div>'
}
document.body.innerHTML += html // 31.919921875ms
console.timeEnd('innerHTML')
<script/>
```

在此基础上实现事件监听就会略微麻烦，只能通过事件代理或者重新选取元素再进行单独绑定

###### <a id="批量修改元素属性样式">批量修改元素属性样式</a>
创建 2 万个 div 元素，以单节点树结构进行排布，每个元素有一个对应的序号作为文本内容。现在通过 style 属性对第 1 个 div 元素进行 2 万次样式调整。下面是直接操作 style 属性的代码：
``` js
const times = 20000;
let html = ''
for (let i = 0; i < times; i++) {
  html = `<div>${i}${html}</div>`
}
document.body.innerHTML += html
const div = document.querySelector('div')
for (let i = 0; i < times; i++) {
  div.style.fontSize = (i % 12) + 12 + 'px'
  div.style.color = i % 2 ? 'red' : 'green'
  div.style.margin = (i % 12) + 12 + 'px'
}
```

如果将需要修改的样式属性放入 JavaScript 数组，然后对这些修改进行 reduce 操作，得到最终需要的样式之后再设置元素属性，那么性能会提升很多。代码如下

``` js
const times = 20000;
let html = ''
for (let i = 0; i < times; i++) {
  html = `<div>${i}${html}</div>`
}
document.body.innerHTML += html
let queue = [] //  创建缓存样式的数组
let microTask // 执行修改样式的微任务
const st = () => {
  const div = document.querySelector('div')
  const style = queue.reduce((acc, cur) => ({...acc, ...cur}), {})
  for(let prop in style) {
    div.style[prop] = style[prop]
  }
  queue = []
  microTask = null
}
const setStyle = (style) => {
  queue.push(style)
  if(!microTask) microTask = Promise.resolve().then(st)
}
for (let i = 0; i < times; i++) {
  const style = {
    fontSize: (i % 12) + 12 + 'px',
    color: i % 2 ? 'red' : 'green',
    margin:  (i % 12) + 12 + 'px'
  }
  setStyle(style)
}

```
virtualDOM 之所以号称高性能，其实现原理就与此类似。

##### <a id="缓存元素集合">缓存元素集合<a>

``` js
    
    for (let i = 0; i < document.querySelectorAll('div').length; i++) {
      document.querySelectorAll(`div`)[i].innerText = i
    }
    
    // 优化 缓存元素集合
    const divs = document.querySelectorAll('div')
    for (let i = 0; i < divs.length; i++) {
      divs[i].innerText = i
    }
```

#### 其他优化 提升渲染性能
- 尽量不要使用复杂的匹配规则和复杂的样式，从而减少渲染引擎计算样式规则生成 CSSOM 树的时间；
- 尽量减少重排和重绘影响的区域；
- 使用 CSS3 特性来实现动画效果。


------------------------------------

*拉勾教育学习笔记，非原创。*
