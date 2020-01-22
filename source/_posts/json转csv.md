---
title: json转csv
date: 2020-01-22 10:47:22
tags: js json csv 下载
---

### 功能： json转csv并下载

示例
```js
downloadJSON2CSV([
    { name: '名称', value: '值', description: '描述' },
    { name: 'adsf', value: 'asdga', description: '132132' }
])
```

```js
function downloadJSON2CSV (objArray, filename = '1.csv') {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
    let str = ''
    for (let i = 0; i < array.length; i++) {
        let line = ''
        for (let index in array[i]) line += array[i][index] + ','
        line.slice(0, line.Length - 1)
        str += line + '\r'
    }

    const elink = document.createElement('a')
    elink.download = filename
    const blob = new Blob([str])
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(blob)
    elink.target = '_blank'
    document.body.appendChild(elink)
    elink.click()
    document.body.removeChild(elink)
}
```
