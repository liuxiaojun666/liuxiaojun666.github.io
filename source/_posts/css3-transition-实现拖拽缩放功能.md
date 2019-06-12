---
title: 实现拖拽缩放任意元素功能
date: 2018-10-24 10:24:44
tags:
---

### 功能

拖拽 缩放。  元素太小，滚动太快可能会出现抖动。  可限制最小缩放倍数。
可拖拽缩放任何元素   依赖jquery

### 使用方法
```html
<div id="dragDiv">
    <svg> </svg>
</div>
```
```js
window.onload = function () {
    const zoom = $solway.zoom({
        ele: document.getElementById('zoomSvg'),
        scale: 0.6,
        minScale: 0.1
    });


    $solway.drag({
        ele: document.getElementById('dragDiv')
    });
};
```
[查看示例](/demo/20181026/ "查看示例")

{% iframe /demo/20181026/ 700 400 %}



### 实现
zoom.js

```js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.$solway = global.$solway || {})));
}(window, ((exports) => {


    const zoom = ({ scale = 1, minScale = 0.1, maxScale = 14, ele, rate = 0.1, translate = [0, 0] }) => {

        const obj = $(ele).css({
            'transition': 'all 0.1s', '-moz-transition': 'all 0.1s', '-webkit-transition': 'all 0.1s', '-o-transition': 'all 0.1s', position: 'absolute', cursor: 'pointer', left: 0, top: 0
        }).on("mousewheel DOMMouseScroll", mouseWheelHandel);

        scaleFunc(0, true);

        function mouseWheelHandel(e) {
            const delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));
            if (delta > 0) return scaleFunc(rate);
            else if (delta < 0) return scaleFunc(-rate);
        }

        function scaleFunc(val, origin) {
            scale += (val * scale);
            scale = scale <= minScale ? minScale : scale;
            scale = scale >= maxScale ? maxScale : scale;
            if (scale <= minScale || scale >= maxScale) return false;
            obj.css({
                'transform': 'matrix(' + scale + ',0,0,' + scale + ', ' + translate[0] + ',' + translate[1] + ')',
                '-ms-transform': 'matrix(' + scale + ',0,0,' + scale + ', ' + translate[0] + ',' + translate[1] + ')',
                '-moz-transform': 'matrix(' + scale + ',0,0,' + scale + ', ' + translate[0] + ',' + translate[1] + ')',
                '-webkit-transform': 'matrix(' + scale + ',0,0,' + scale + ', ' + translate[0] + ',' + translate[1] + ')',
                '-o-transform': 'matrix(' + scale + ',0,0,' + scale + ', ' + translate[0] + ',' + translate[1] + ')',
            });
            return false;
        }

        return {
            scale(n) {
                scaleFunc(n - scale);
            },
            destroy() {
                obj.off("mousewheel DOMMouseScroll", mouseWheelHandel);
            }
        };
    };

    exports.zoom = zoom;
})));
```

drag.js
```js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.$solway = global.$solway || {})));
}(window, ((exports) => {

    const drag = ({ele: dv}) => {
        dv.setAttribute('style', (dv.getAttribute('style') || '') + 'position: absolute;transition: all 0.1s ease 0s;-webkit-transition: all 0.1s ease 0s;-o-transition: all 0.1s ease 0s;-moz-transition: all 0.1s ease 0s;-moz-user-select: -moz-none; -moz-user-select: none; -o-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;');
        let x = 0;
        let y = 0;
        let l = 0;
        let t = 0;
        let isDown = false;
        dv.addEventListener('mousedown', eleMousedown);
        document.addEventListener('mousemove', eleMousemove);
        dv.addEventListener('mouseup', eleMouseup);
        
        
        //鼠标按下事件
        function eleMousedown (e) {
            //获取x坐标和y坐标
            x = e.clientX;
            y = e.clientY;

            //获取左部和顶部的偏移量
            l = dv.offsetLeft;
            t = dv.offsetTop;
            //开关打开
            isDown = true;
            //设置样式  
            dv.style.cursor = 'move';
            return false;
        }
        //鼠标移动
        function eleMousemove (e) {
            if (isDown == false) {
                return;
            }
            //获取x和y
            const nx = e.clientX;
            const ny = e.clientY;
            //计算移动后的左偏移量和顶部的偏移量
            const nl = nx - (x - l);
            const nt = ny - (y - t);

            dv.style.left = nl + 'px';
            dv.style.top = nt + 'px';
            return false;
        }
        //鼠标抬起事件
        function eleMouseup () {
            //开关关闭
            isDown = false;
            dv.style.cursor = 'default';
            return false;
        }
        return {
            destroy() {
                dv.removeEventListener('mousedown', eleMousedown);
                document.removeEventListener('mousemove', eleMousemove);
                dv.removeEventListener('mouseup', eleMouseup);                
                dv = null;
            }
        }
    };

    exports.drag = drag;
})));
```
