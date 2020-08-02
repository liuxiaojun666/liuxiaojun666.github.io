---
title: css布局
date: 2020-07-30 20:40:58
tags:
---

##### 单列布局

设置布局容器（最大）宽度以及左右边距为 auto 即可实现

##### 2列 3列布局步骤

（1）为了保证主要布局容器优先级，应将主要布局容器写在次要布局容器之前。

（2）将布局容器进行水平排列；

（3）设置宽度，即次要容器宽度固定，主要容器撑满；

（4）消除布局方式的副作用，如浮动造成的高度塌陷；

（5）为了在窄屏下也能正常显示，可以通过媒体查询进行优化。

##### 2列布局

``` html
<div class="wrap">
  <main class="main">主要布局容器</main>
  <aside class="aside">次要布局容器</aside>
</div>

```
``` css
.wrap {
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
  }
  .main {
    flex: 1;
  }
  .aside {
    width: 200px;
  }
  @media only screen and (max-width: 1000px) {
    .wrap {
      flex-direction: row;
    }
    .main {
      flex: 100%;
    }
  }
```
![两列布局](https://s0.lgstatic.com/i/image/M00/0E/03/Ciqc1F7E7vOAaoMnAALoOB59RVs256.gif)


##### 3列布局

``` html
<div class="wrap">
  <main class="main">main</main>
  <aside class="left">left</aside>
  <aside class="right">right</aside>
</div>
```

``` css
.main, .left, .right {
    float: left;
  }
  .wrap {
    padding: 0 200px 0 300px;
  }
  .wrap::after {
    content: '';
    display: block;
    clear: both;
  }
  .main {
    width: 100%;
  }
  .left {
    width: 300px;
    position: relative;
    left: -300px;
    margin-left: -100%;
  }
  .right {
    position: relative;
    width: 200px;
    margin-left: -200px;
    right: -200px;
  }
  @media only screen and (max-width: 1000px) {
    .wrap {
      padding: 0;
    }
    .left {
      left: 0;
      margin-left: 0;
    }
    .right {
      margin-left: 0;
      right: 0;
    }
  }
```
标准圣杯布局没有媒体查询
![3列圣杯布局](https://s0.lgstatic.com/i/image/M00/0E/03/Ciqc1F7E72KAcZENAAI1dbZkP0I370.gif)

##### 垂直方向的布局 上中下

``` html
<div class="container">
  <header></header>
  <main></main>
</div>
<footer></footer>
```
``` css
.container {
    box-sizing: border-box;
    min-height: 100vh;
    padding-bottom: 100px;
  }
  header, footer {
    height: 100px;
  }
  footer {
    margin-top: -100px;
  }
```

