---
title: js节流
date: 2020-07-29 21:03:53
tags:
---


``` js

const throttle = (func, wait = 0, execFirstCall) => {
  let timeout = null
  let args
  let firstCallTimestamp


  function throttled(...arg) {
    if (!firstCallTimestamp) firstCallTimestamp = new Date().getTime()
    if (!execFirstCall || !args) {
      console.log('set args:', arg)
      args = arg
    }
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    // 以Promise的形式返回函数执行结果
    return new Promise(async(res, rej) => {
      if (new Date().getTime() - firstCallTimestamp >= wait) {
        try {
          const result = await func.apply(this, args)
          res(result)
        } catch (e) {
          rej(e)
        } finally {
          cancel()
        }
      } else {
        timeout = setTimeout(async () => {
          try {
            const result = await func.apply(this, args)
            res(result)
          } catch (e) {
            rej(e)
          } finally {
            cancel()
          }
        }, firstCallTimestamp + wait - new Date().getTime())
      }
    })
  }
  // 允许取消
  function cancel() {
    clearTimeout(timeout)
    args = null
    timeout = null
    firstCallTimestamp = null
  }
  // 允许立即执行
  function flush() {
    cancel()
    return func.apply(this, args)
  }
  throttled.cancel = cancel
  throttled.flush = flush
  return throttled
}

```

``` js
const scrollFunc = throttle(e => {
  let highlightId = ''
  // 遍历大纲章节位置，与滚动距离比较，得到当前高亮章节id
  for (let id in offsetMap) {
    if (e.target.scrollTop <= offsetMap[id].offsetTop) {
      highlightId = id
      break
    }
  }
  const lastDom = document.querySelector('.highlight')
  const currentElem = document.querySelector(`a[href="#${highlightId}"]`)
  // 修改高亮样式
  if (lastDom && lastDom.id !== highlightId) {
    lastDom.classList.remove('highlight')
    currentElem.classList.add('highlight')
  } else {
    currentElem.classList.add('highlight')
  }
}, 200)

// 监听scroll事件
wrap.addEventListener('scroll', scrollFunc)

```


------------------------------------

*拉勾教育学习笔记，非原创。*