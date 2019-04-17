---
title: 静态html模板实现
date: 2019-01-16 16:10:22
tags:
---

可读取静态html文件，用字符串的方式插入dom中
仅适用于纯html模板，模板中script表情内js不会生效，可在回调函数中插入模板同时，创建并插入js外链。


xhr请求，blob类型接收，存储为blob，用FileReader读取blob内容。


```js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.$solway = global.$solway || {})));
}(window, ((exports) => {
    const download = (url, callback = () => {}) => {
        const oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            if (oReq.response.size === 0 || oReq.status === 404) {
                if (confirm(' 文件为空或不存在，确定继续执行吗？')) __fun();
                return callback();
            } else __fun();


            function __fun() {
                const _blob = new Blob([oReq.response]);
                const reader = new FileReader();
                reader.onload = function (event) {
                    const content = reader.result;
                    callback(content);
                };
                reader.readAsText(_blob);
            }
        };
        oReq.send();
    };

    exports.getFileStr = download;
})));
```
