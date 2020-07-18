---
title: 看不见的html标签
date: 2020-07-17 21:32:55
tags: html 优化 前端
---


#### meta 标签：自动刷新/跳转
``` html
<!-- 5秒后跳转到page2 -->
<meta http-equiv="Refresh" content="5; URL=page2.html">

<!-- 60秒自动刷新 -->
<meta http-equiv="Refresh" content="60">

```


#### title 标签与 Hack 手段：消息提醒
``` js
let msgNum = 1 // 消息条数
let cnt = 0 // 计数器
const inerval = setInterval(() => {
  cnt = (cnt + 1) % 2
  if(msgNum===0) {
    // 通过DOM修改title
    document.title += `聊天页面`
    clearInterval(interval)
    return
  }
  const prefix = cnt % 2 ? `新消息(${msgNum})` : ''
  document.title = `${prefix}聊天页面`
}, 1000)
```
![图片](https://s0.lgstatic.com/i/image/M00/07/67/CgqCHl65LJGAR25PAAAXBLXRFXg133.gif)
HTML5 下可使用 Web Notifications API 弹出系统消息


#### script 标签：调整加载顺序提升渲染速度
- async 属性。立即请求文件，但不阻塞渲染引擎，而是文件加载完毕后阻塞渲染引擎并立即执行文件内容。

- defer 属性。立即请求文件，但不阻塞渲染引擎，等到解析完 HTML 之后再执行文件内容。

- HTML5 标准 type 属性，对应值为“module”。让浏览器按照 ECMA Script 6 标准将文件当作模块进行解析，默认阻塞效果同 defer，也可以配合 async 在请求完成后立即执行
![图片](https://s0.lgstatic.com/i/image/M00/07/0E/Ciqc1F647iiAZx3cAAB1ewBzlh0431.png)


#### link 标签：通过预处理提升渲染速度
- dns-prefetch。当 link 标签的 rel 属性值为“dns-prefetch”时，浏览器会对某个域名预先进行 DNS 解析并缓存。这样，当浏览器在请求同域名资源的时候，能省去从域名查询 IP 的过程，从而减少时间损耗。
![图片](https://s0.lgstatic.com/i/image/M00/07/0E/Ciqc1F647jWAHmc_AAAiNGoHmY8154.png)

- preconnect。让浏览器在一个 HTTP 请求正式发给服务器前预先执行一些操作，这包括 DNS 解析、TLS 协商、TCP 握手，通过消除往返延迟来为用户节省时间。

- prefetch/preload。两个值都是让浏览器预先下载并缓存某个资源，但不同的是，prefetch 可能会在浏览器忙时被忽略，而 preload 则是一定会被预先下载。

- prerender。浏览器不仅会加载资源，还会解析执行页面，进行预渲染。

![图片](https://s0.lgstatic.com/i/image/M00/07/0E/Ciqc1F647j-AFiBtAABWh7ld3uA965.png)


#### 搜索优化

``` html 
<meta content="拉勾,拉勾网,拉勾招聘,拉钩, 拉钩网 ,互联网招聘,拉勾互联网招聘, 移动互联网招聘, 垂直互联网招聘, 微信招聘, 微博招聘, 拉勾官网, 拉勾百科,跳槽, 高薪职位, 互联网圈子, IT招聘, 职场招聘, 猎头招聘,O2O招聘, LBS招聘, 社交招聘, 校园招聘, 校招,社会招聘,社招" name="keywords">
```

#### link 标签：减少重复
有时候为了用户访问方便或者出于历史原因，对于同一个页面会有多个网址，又或者存在某些重定向页面，比如：
- https://lagou.com/a.html
- https://lagou.com/detail?id="abcd"
那么在这些页面中可以这样设置：
``` html 
<link href="https://lagou.com/a.html" rel="canonical">
```
这样可以让搜索引擎避免花费时间抓取重复网页。不过需要注意的是，它还有个限制条件，那就是指向的网站不允许跨域。

当然，要合并网址还有其他的方式，比如使用站点地图，或者在 HTTP 请求响应头部添加 rel="canonical"。

#### OGP（开放图表协议）
OGP 是 Facebook 公司在 2010 年提出的，目的是通过增加文档信息来提升社交网页在被分享时的预览效果。你只需要在一些分享页面中添加一些 meta 标签及属性，支持 OGP 协议的社交网站就会在解析页面时生成丰富的预览信息，比如站点名称、网页作者、预览图片。具体预览效果会因各个网站而有所变化。





------------------------------------

*拉勾教育学习笔记，非原创。*