---
title: angular封装loading
date: 2017-11-23 10:44:21
tags: angular loading
---

### 功能介绍

使用简单方便，可局部loading，可多loading

### 使用方法

``` html
<div class="content-right clearfix" d-loding="detail.isLoding">
    <!-- 这里是内容 -->
</div>
```

### 实现方法

js 
``` js
/**
 * [loding动画]
 * params{d-loding="true/false"}
 */
app.directive('dLoding', [() => ({
    restrict: 'A',
    transclude: !0,
    replace: !0,
    scope: {
        dLoding: '='
    },
    template: `
<div>
    <div ng-transclude class="clearfix" style="height:100%;"></div>
    <div class="loding-view" ng-if="dLoding" style="position:absolute;width:100%;height:100%;top:0;left:0;z-index:9999;text-align:center;background:rgba(255,255,255,.8)">
    <div class="spinner">
        <div class="rect1"></div>
        <div class="rect2"></div>
        <div class="rect3"></div>
        <div class="rect4"></div>
        <div class="rect5"></div>
    </div>
    </div>
</div>`,
    link ($scope, $element) {
        $($element).css('position', 'relative')
    }
})])
```

css 

``` less
.spinner {
    margin: 75pt auto;
    width: 50px;
    height: 60px;
    text-align: center;
    font-size: 10px;

    & > div {
        display: inline-block;
        width: 6px;
        margin: 1px;
        height: 100%;
        background-color: #67cf22;
        animation: stretchdelay 1.2s infinite ease-in-out;
    }
    .rect2 {
        animation-delay: -1.1s;
    }
    .rect3 {
        animation-delay: -1s;
    }
    .rect4 {
        animation-delay: -.9s;
    }
    .rect5 {
        animation-delay: -.8s;
    }
}
@keyframes stretchdelay {
    0%, 40%, to {
        -webkit-transform: scaleY(.4);
        transform: scaleY(.4)
    }
    20% {
        -webkit-transform: scaleY(1);
        transform: scaleY(1)
    }
}
```
