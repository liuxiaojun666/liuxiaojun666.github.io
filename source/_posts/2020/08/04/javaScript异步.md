---
title: javaScript异步
date: 2020-08-04 20:59:34
tags:
---

#### 异步和同步

程序在同步调用函数的时候，会立即执行操作并等待得到返回结果后再继续运行，也就是说同步执行是阻塞的。

而异步会将操作和结果在时间上分隔开来，在当下执行操作，在未来某个时刻返回结果，在这个等待返回结果的过程中，程序将继续执行后面的代码。也就是说异步执行是非阻塞的。

``` js
function syncAdd(a, b) {
  return a + b;
}
syncAdd(1, 2) // 立即得到结果 3
function asyncAdd(a, b, cb) {
  setTimeout(function() {
    cb(a + b);
  }, 1000)
}
asyncAdd(1, 2, console.log) // 1s后打印结果 3
```
``` js
var a = {
  counter: {
    index: 1
  }
};
console.log( a ); // ?  {conter:{index: 2}}。
a.counter.index++;
// 原因在于浏览器在运行代码的时候，把控制台打印这种涉及 I/O 的操作进行了延迟执行。
```

#### 异步原理

JavaScript 是单线程的。把一些操作交给了其他线程处理，然后采用了一种称之为“事件循环”（也称“事件轮询”）的机制来处理返回结果。



数组 eventLoop 表示事件队列（也有称作“任务队列”），用来存放需要执行的任务事件（可以理解为回调函数），对象 event 变量表示当前需要执行的任务事件。

用一个永不停止的 while 循环来表示事件循环，每一次循环称为一个 tick。

对每个 tick 而言，如果在队列中有等待事件，那么就会从队列中获取一个事件并执行，这些事件通常是回调函数的形式。
``` js
var eventLoop = []; // 事件队列，先进先出
var event; // 事件执行成功的回调回调函数
while (true) {
  // 一次tick
  if (eventLoop.length > 0) {
    // 队列中取出回调函数
    event = eventLoop.shift();
    try {
      event();
    } catch (err) {
      reportError(err); 
    }
  }
}
```

当我们发出一个 AJAX 请求时，浏览器会将请求任务分派给网络线程来进行处理，当对应的网络线程拿到返回的数据之后，就会把回调函数插入到事件队列中。

setTimeout 和 setInterval 也是同样的道理，当我们执行 setTimeout 的时候并不是直接把回调函数放入事件队列中。它所做的是交给定时器线程来处理，当定时器到时后，再把回调函数放在事件队列中，这样，在未来的某轮 tick 中获取并执行这个回调函数。

这么做有一个隐性的问题，如果事件队列中已经有其他事件，那么这个回调就会排队等待。

所以说 setTimeout/setInterval 定时器的精度并不高。准确地说，它只能确保回调函数不会在指定的时间间隔之前运行，但可能会在那个时刻运行，也可能在那之后运行，这就要根据事件队列的状态而定。


**事件队列按照先进先出的顺序执行，那么如果队列较长时，排在后面的事件即使较为“紧急”，也得需要等待前面的任务先执行完成。**

JavaScript 解决这个问题的思路就是：**设置多个队列，按照优先级来执行**。

``` js
function f1() {
  setTimeout(console.log.bind(null,1), 0)
}
function f2() {
  Promise.resolve().then(console.log.bind(null,2))
}
function f3() {
  setTimeout(() => {
    console.log(3)
    f2()
  }, 0)
}
function f4() {
  Promise.resolve().then(() => {
    console.log(4)
    f1()
  }, 0)
}
f3()
f4()
```

这段代码的执行过程和结果可以查看下图，当调用函数 f3 和函数 f4 之后，绿色队列和红色队列都会被插入一个匿名回调函数。

1. 第 1 次 tick，由于红色队列优先级高，所以先执行红色匿名函数，控制台打印数字 4，然后调用函数 f1，向绿色队列中插入一个打印函数；
1. 第 2 次 tick，按照先进先出原则，此时调用匿名函数打印数字 3，并调用函数 f2，向红色队列中插入一个打印函数；
1. 第 3 次 tick，调用红色队列中的打印函数，控制台打印数字 2；
1. 第 4 次 tick，调用绿色队列中的打印函数，控制台打印数字 1。
![示例图](https://s0.lgstatic.com/i/image/M00/1F/41/CgqCHl7m1W-AUWjTAAGFy-O9UzA843.png)

**不同队列优先级不同，每次事件循环时会从优先级高的队列中获取事件，只有当优先级高的队列为空时才会从优先级低的队列中获取事件，同级队列之间的事件不存在优先级，只遵循先进先出的原则。**


常见的异步函数优先级如下，从上到下优先级逐层降低：

```
process.nextTick(Node.js) > 
MutationObserver(浏览器)/promise.then(catch、finnally)>
setImmediate(IE) > 
setTimeout/setIntervalrequestAnimationFrame >
其他 I/O 操作 / 浏览器 DOM 事件
```

#### 异步串行

``` js
asyncF1()
.then(data => asyncF2(data))
.then(() => {
  ...
})
.catch(e => console.error(e))
```
``` js
(async function() {
  try {
    const data = await asyncFn1()
    const result = await asyncFn2(data)
    ...
  } catch(e) {
    console.error(e)
  }
})()
```
按照顺序执行调用 asyncF 函数 n 次
``` js
[1...n].reduce(async (lastPromise, i) => {
  try {
    await lastPromise
    console.log(await asyncF())
  } catch(e) {
    console.error(e)
  }
}, Promise.resolve())
```
延迟打印数组 [1,2,3,4,5]，每一次打印的初始延迟为 1000ms，增长延迟为 500ms。
``` js
const arr = [1, 2, 3, 4, 5]
arr.reduce(async (prs, cur, index) => {
  const t = await prs
  const time = index === 0 ? 0 : 1000 + (index - 1) * 500
  return new Promise((res) => {
    setTimeout(() => {
      console.log(cur);
      res(time)
    }, time)
  })
}, Promise.resolve(0))
```

#### 异步并行

**(1)Promise.all([promise1 ...... promiseN])**

调用函数 Promise.all 会返回一个新的 Promise 实例，该实例在参数内所有的 promise 都完成 (resolved) 时回调完成 (resolve)；如果参数中  promise 有一个失败（rejected），那么此实例返回第一个失败 promise 的结果。

当执行的异步函数具有强一致性时可以使用它，比如要更新一个较大的表单数据，会发送多个请求分别更新不同的数据，如果一个请求更新失败则放弃本次提交。


**（2）Promise.allSettled([promise1......promiseN])**

调用函数 Promise.allsellted 会返回一个新的 Promise 实例，该实例会在所有给定的 promise 已经执行完成时返回一个对象数组，每个对象表示对应的 promise 结果。

这个函数适用于需要并发执行多个异步函数，这些异步函数的执行结果相互独立。比如同时发送多个 AJAX 请求来分别更新多条数据。

**（3）Promise.race([promise1......promiseN])**

调用函数 Promise.race 会返回一个新的 promise 实例，一旦参数中的某个 promise 执行完成，新的 promise 实例就会返回对应 promise 的执行结果。

这个函数会让多个并发函数产生“竞争”，从而挑选出最先执行完成的。比如尝试从多个网址加载图片资源。


####  异常处理

``` js
new Promise((resolve, reject) => {
  throw new Error(0) // 等价于  reject(new Error(0)) 
})
```
建议尽量使用 catch 子句而不是在 then 子句中捕获 Promise 异常，因为这样可以捕获 then 子句中的异常信息。
``` js
Promise.resolve(1)
.then(data => {
  const arr = data.split('')
  //...
}, error => {  // 这里捕获不到
  // ...
})
Promise.resolve(1)
.then(data => {
  const arr = data.split('')
  // ...
})
.catch(error => { // 这里可以捕获
  // ...
})
```

#### Promise 的局限性

**立即执行**
当一个 Promise 实例被创建时，内部的代码就会立即被执行，而且无法从外部停止。比如无法取消超时或消耗性能的异步调用，容易导致资源的浪费。

**单次执行**
Promise 处理的问题都是“一次性”的，因为一个 Promise 实例只能 resolve 或 reject 一次

