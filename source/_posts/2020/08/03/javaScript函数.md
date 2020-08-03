---
title: javaScript函数
date: 2020-08-03 20:53:17
tags:
---

JavaScript 中的函数相对于数据类型而言更加复杂，它可以有属性，也可以被赋值给一个变量，还可以作为参数被传递......

#### this 关键字
一般指向调用它的对象。

这句话其实有两层意思，首先 this 指向的应该是一个对象，更具体地说是函数执行的“上下文对象”。
其次这个对象指向的是“调用它”的对象，如果调用它的不是对象或对象不存在，则会指向全局对象（严格模式下为 undefined）。

``` js
// 代码 1
var o = {
  fn() {
    console.log(this)
  }
}
// 对象o调用的  fn，
o.fn() // o


// 代码 2
class A {
  fn() {
    console.log(this)
  }
}
var a = new A() 
// 对象a 调用的 fn
a.fn()// a



// 代码 3
function fn() {
  console.log(this)
}
// 调用者为全局
fn() // 浏览器：Window；Node.js：global
```

``` js
function fn() {console.log(this)}
function fn2() {
    // 调用者为 fn2 函数，不是一个对象。所以指向全局
    fn()
}
fn2() // ?
```

``` js
function fn() {console.log(this)}
function fn2() {
    // fn2 虽然是obj对象的属性，但是 fn还是被函数调用的，不是对象调用的。所以指向全局
    fn()
}
var obj = {fn2}
obj.fn2() // ?
```

``` js
var dx = {
  arr: [1]
}
dx.arr.forEach(function() {
    console.log(this)
}) // ?  全局对象
// forEach 有两个参数，一个是回调函数，第二个是 this 指向的对象，这里只传入了回调函数，第二个参数没有传入，默认为 undefined

// every()、find()、findIndex()、map()、some() 类似
```

``` js
// ES6 下的 class 内部默认采用的是严格模式
class B {
  fn() {
    console.log(this)
  }
}
var b = new B()
var fun = b.fn
fun() // ?  undefind
// 格模式下不会指定全局对象为默认调用对象
```

``` js
var arrow = {fn: () => {
  console.log(this)
}}
arrow.fn() // ? 全局

// 箭头函数的 this 继承自上层的 this。 在全局环境下定义仍会指向全局对象
```

``` js
var arrow = {
  fn() {
    const a = () => console.log(this)
    a()
  }
}
arrow.fn()  // arrow
```

``` js
[0].forEach(function() {console.log(this)}, 0) // ?
// 基础类型也可以转换成对应的引用对象。
// 这里 this 指向的是一个值为 0 的 Number 类型对象。
```

改变 this 指向的常见 3 种方式有 bind、call 和 apply。
``` js
function getName() {console.log(this.name)}
// bind 有些特殊，它不但可以绑定 this 指向也可以绑定函数参数并返回一个新的函数，当 c 调用新的函数时，绑定之后的 this 或参数将无法再被改变。
var b = getName.bind({name: 'bind'})
b()
// call 和 apply 用法功能基本类似，都是通过传入 this 指向的对象以及参数来调用函数。区别在于传参方式，前者为逐个参数传递，后者将参数放入一个数组，以数组的形式传递。
getName.call({name: 'call'})
getName.apply({name: 'apply'})

```

#### 箭头函数
- 不绑定 arguments 对象，也就是说在箭头函数内访问 arguments 对象会报错；
- 不能用作构造器，也就是说不能通过关键字 new 来创建实例；
- 默认不会创建 prototype 原型属性；
- 不能用作 Generator() 函数，不能使用 yeild 关键字。

#### 函数的转换
编写一个 add() 函数，支持对多个参数求和以及多次调用求和。示例如下：
``` js
add(1) // 1
add(1)(2)// 3
add(1, 2)(3, 4, 5)(6) // 21
```
``` js
function add(...args) {
  let arr = args
  function fn(...newArgs) {
    arr = [...args, ...newArgs]
    return fn;
  }
// toString() 函数会在打印函数的时候调用，比如 console.log、valueOf 会在获取函数原始值时调用，比如加法操作。
  fn.toString = fn.valueOf = function() {
    return arr.reduce((acc, cur) => acc + parseInt(cur))
  }
  return fn
}
```

#### 原型
函数其实也是一种特殊的对象
``` js
function fn(){} 
fn instanceof Object // true
```

##### 什么是原型和原型链？

简单地理解，原型就是对象的属性，包括被称为隐式原型的 \__proto__ 属性和被称为显式原型的 prototype 属性。

隐式原型通常在创建实例的时候就会自动指向构造函数的显式原型。例如，在下面的示例代码中，当创建对象 a 时，a 的隐式原型会指向构造函数 Object() 的显式原型。
``` js
var a = {}
a.__proto__ === Object.prototype // true
var b= new Object()
b.__proto__ === a.__proto__ // true
```

显式原型是内置函数（比如 Date() 函数）的默认属性，在自定义函数时（箭头函数除外）也会默认生成，生成的显式原型对象只有一个属性 constructor ，该属性指向函数自身。通常配合 new 关键字一起使用，当通过 new 关键字创建函数实例时，会将实例的隐式原型指向构造函数的显式原型。

``` js
function fn() {} 
fn.prototype.constructor === fn // true
```

``` js
var parent = {code:'p',name:'parent'}
var child = {__proto__: parent, name: 'child'}
console.log(parent.prototype) // undefined
console.log(child.name) // "child"
console.log(child.code) // "p"
child.hasOwnProperty('name') // true
child.hasOwnProperty('code') // false
// 当打印 child.name 的时候会输出对象 child 的 name 属性值，当打印 child.code 时由于对象 child 没有属性 code，所以会找到原型对象 parent 的属性 code，将 parent.code 的值打印出来。同时可以通过打印结果看到，对象 parent 并没有显式原型属性。如果要区分对象 child 的属性是否继承自原型对象，可以通过 hasOwnProperty() 函数来判断。
```
在这个例子中，如果对象 parent 也没有属性 code，那么会继续在对象 parent 的原型对象中寻找属性 code，以此类推，逐个原型对象依次进行查找，直到找到属性 code 或原型对象没有指向时停止。

这种类似递归的链式查找机制被称作“原型链”。
``` js
Function.prototype === Object.__proto__ //true
```

#### new 操作符实现了什么？
``` js
function F(init) {}
var f = new F(args)
```
1. 创建一个临时的空对象，为了表述方便，我们命名为 fn，让对象 fn 的隐式原型指向函数 F 的显式原型；
1. 执行函数 F()，将 this 指向对象 fn，并传入参数 args，得到执行结果 result；
1. 判断上一步的执行结果 result，如果 result 为非空对象，则返回 result，否则返回 fn。

``` js
var fn = Object.create(F.prototype)
var obj = F.apply(fn, args)
var f = obj && typeof obj === 'object' ? obj : fn;
```

#### 怎么通过原型链实现多层继承？

``` js
function A() {
}
A.prototype.a = function() {
  return 'a';
}
function B() {
}
B.prototype = new A()
B.prototype.b = function() {
  return 'b';
}
var c = new B()
c.b() // 'b'
c.a() // 'a'
```

#### typeof 和 instanceof
typeof

用来获取一个值的类型，可能的结果有下面几种：


| 类型      |   	结果    |
| --------- |       ------- |
| Undefined         |   	"undefined"                 |
| Boolean       |   	"boolean"               |
| Number        |   	"number"                |
| BigInt        |   	"bigint"                |
| String        |   	"string"                |
| Symbol        |   	"symbol"                |
| 函数对象      |   	"function"              |
| 其他对象及null        |    	"object"                |

instanceof

用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。

#### 作用域
作用域是指赋值、取值操作的执行范围，通过作用域机制可以有效地防止变量、函数的重复定义，以及控制它们的可访问性。

虽然在浏览器端和 Node.js 端作用域的处理有所不同，比如对于全局作用域，浏览器会自动将未主动声明的变量提升到全局作用域，而 Node.js 则需要显式的挂载到 global 对象上。又比如在 ES6 之前，浏览器不提供模块级别的作用域，而 Node.js 的 CommonJS 模块机制就提供了模块级别的作用域。但在类型上，可以分为全局作用域（window/global）、块级作用域（let、const、try/catch）、模块作用域（ES6 Module、CommonJS）及本课时重点讨论的函数作用域。

#### 命名提升
``` js
console.log(a) // undefined
var a = 1
console.log(b) // 报错
let b = 2
// 仅限 var 关键字声明的变量，对于 let 和 const 在定义之前引用会报错。
```

``` js
f();
// 方式1  报错
var f = function() {...}
// 方式2  正常执行
function f() {...}
```

#### 闭包
在函数内部访问外部函数作用域时就会产生闭包。闭包很有用，因为它允许将函数与其所操作的某些数据（环境）关联起来。这种关联不只是跨作用域引用，也可以实现数据与函数的隔离。
``` js
var SingleStudent = (function () { 
    function Student() {}
    var _student; 
    return function () {
        if (_student) return _student;
        _student = new Student()
        return _student;
    }
}())
var s = new SingleStudent()
var s2 = new SingleStudent()
s === s2 // true
```

#### 经典笔试题

``` js
for( var i = 0; i < 5; i++ ) {
	setTimeout(() => {
		console.log( i );
	}, 1000 * i)
}
// 需要实现的功能是每隔 1 秒控制台打印数字 0 到 4。但实际执行效果是每隔一秒打印的数字都是 5
```

``` js
for(let i = 0; i < 5; i++ ) {
	setTimeout(() => {
		console.log(i);
	}, 1000 * i)
}
/**
等价于
for(var i = 0; i < 5; i++ ) {
    let _i = i
	setTimeout(() => {
		console.log(_i);
	}, 1000 * i)
}
 */
```

