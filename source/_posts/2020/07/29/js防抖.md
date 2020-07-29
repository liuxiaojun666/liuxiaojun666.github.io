---
title: js防抖
date: 2020-07-29 20:52:22
tags:
---

``` js
const debounce = (func, wait = 0) => {
  let timeout = null
  let args
  function debounced(...arg) {
    args = arg
    if(timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    // 以Promise的形式返回函数执行结果
    return new Promise((res, rej) => {
      timeout = setTimeout(async () => {
        try {
          const result = await func.apply(this, args)
          res(result)
        } catch(e) {
          rej(e)
        }
      }, wait)
    })
  }
  // 允许取消
  function cancel() {
    clearTimeout(timeout)
    timeout = null
  }
  // 允许立即执行
  function flush() {
    cancel()
    return func.apply(this, args)
  }
  debounced.cancel = cancel
  debounced.flush = flush
  return debounced
}

```

``` js
const ipt = document.querySelector('input')

ipt.addEventListener('input', debounce(e => {
    search(e.target.value).then(resp => {
      // ...
    }, e => {
      // ...
    })
}, 500))
```

------------------------------------

*拉勾教育学习笔记，非原创。*
