---
title: 文件下载与文件流blob获取
date: 2019-01-16 16:06:58
tags:
---

默认下载文件
有下载进度
blob为true时，回调函数接收一个blob对象为参数。

```js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.$solway = global.$solway || {})));
}(window, ((exports) => {
    const download = ({
        url,
        filename,
        callback = () => {},
        blob = false,
        download = true,
        progress = () => {}
    }) => {
        const oReq = new XMLHttpRequest();
        oReq.open("GET", url, true); //'/minio/download.htm?id=25'
        oReq.responseType = "blob";
        oReq.addEventListener("progress", ({ total, loaded }) => progress(total, loaded), false);
        oReq.onload = function (oEvent) {
            if (oReq.response.size === 0 || oReq.status === 404) {
                if (confirm(' 文件为空或不存在，确定继续执行吗？')) __fun();
                return callback();
            } else __fun();

            
            function __fun() {
                const _blob = new Blob([oReq.response]);
                if (download) {
                    const elink = document.createElement('a');
                    const hasFileName = oReq.getResponseHeader('content-disposition');
                    elink.download = filename || (hasFileName && decodeURI(hasFileName.split(`UTF-8''`)[1])) || '未命名.你想要的扩展名';
                    elink.style.display = 'none';
                    elink.href = URL.createObjectURL(_blob);
                    elink.target = '_blank';
                    document.body.appendChild(elink);
                    elink.click();
                    document.body.removeChild(elink);
                    if (!blob) callback();
                }
                if (blob) {
                    callback(_blob);
                }
            }
        };
        oReq.send();
    };

    exports.download = download;
})));
```
