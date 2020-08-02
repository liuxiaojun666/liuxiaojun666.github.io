---
title: javascript数据类型
date: 2020-08-02 16:52:12
tags:
---

#### javaScript数据类型有哪些
JavaScript 的数据类型可以分为 8 种：
- 空（Null）
- 未定义（Undefined）
- 数字（Number）
- 数字（Bigint）
- 字符串（String）
- 布尔值（Boolean）
- 符号（Symbol）
- 对象（Object）

其中前 7 种类型为基础类型，最后 1 种为引用类型。这两者的区别在于，基础类型的数据在被引用或拷贝时，是值传递，也就是说会创建一个完全相等的变量；而引用类型只是创建一个指针指向原有的变量，实际上两个变量是“共享”这个数据的，并没有重新创建一个新的数据。


#### Undefined

Undefined 是一个很特殊的数据类型，它只有一个值，也就是 undefined。可以通过下面几种方式来得到 undefined：

- 引用已声明但未初始化的变量；
- 引用未定义的对象属性；
- 执行无返回值函数；
- 执行 void 表达式；
- 全局常量 window.undefined 或 undefined。

``` js
var a; // undefined
var o = {}
o.b // undefined
(() => {})() // undefined
void 0 // undefined
window.undefined // undefined
```

其中比较推荐通过 void 表达式来得到 undefined 值，因为这种方式既简便（window.undefined 或 undefined 常量的字符长度都大于 "void 0" 表达式）又不需要引用额外的变量和属性；同时它作为表达式还可以配合三目运算符使用，代表不执行任何操作。

##### 如何判断一个变量的值是否为 undefined 呢？
``` js
// 方式1
if(!x) {
  ...
}
// xxx 只要变量 x 的值为 undefined、空字符串、数值 0、null 时都会判断为真


// 方式2
if(x===undefined) {
  ...
}
// 虽然通过 “===” 和 undefined 值做比较是可行的，但如果 x 未定义则会抛出错误 “ReferenceError: x is not defined” 导致程序执行终止，这对于代码的健壮性显然是不利的


// 方式2
if(typeof x === 'undefined') {
  ...
}
// √√√√√√

```

#### Null

Null 数据类型和 Undefined 类似，只有唯一的一个值 null，都可以表示空值，甚至我们通过 “==” 来比较它们是否相等的时候得到的结果都是 true，但 null 是 JavaScript 保留关键字，而 undefined 只是一个常量。

也就是说我们可以声明名称为 undefined 的变量（虽然只能在老版本的 IE 浏览器中给它重新赋值），但将 null 作为变量使用时则会报错。

#### Boolean

Boolean 数据类型只有两个值：true 和 false，分别代表真和假，理解和使用起来并不复杂。但是我们常常会将各种表达式和变量转换成 Boolean 数据类型来当作判断条件，这时候就要注意了。

下面是一个简单地将星期数转换成中文的函数，比如输入数字 1，函数就会返回“星期一”，输入数字 2 会返回“星期二”，以此类推，如果未输入数字则返回 undefined。

``` js
function getWeek(week) {
  const dict = ['日', '一', '二', '三', '四', '五', '六'];
  if(week) return `星期${dict[week]}`;
}
```
这里在 if 语句中就进行了类型转换，将 week 变量转换成 Boolean 数据类型，而 0、空字符串、null、undefined 在转换时都会返回 false。所以这段代码在输入 0 的时候不会返回“星期日”，而返回 undefined。
我们在做强制类型转换的时候一定要考虑这个问题。

#### Number

##### 两个重要值
Number 是数值类型，有 2 个特殊数值得注意一下，即 NaN 和 Infinity

- NaN（Not a Number）通常在计算失败的时候会得到该值。要判断一个变量是否为 NaN，则可以通过 Number.isNaN 函数进行判断。
- Infinity 是无穷大，加上负号 “-” 会变成无穷小，在某些场景下比较有用，比如通过数值来表示权重或者优先级，Infinity 可以表示最高优先级或最大权重。

##### 进制转换
当我们需要将其他进制的整数转换成十进制显示的时候可以使用 parseInt 函数，该函数第一个参数为数值或字符串，第二个参数为进制数，默认为 10，当进制数转换失败时会返回 NaN。所以，如果在数组的 map 函数的回调函数中直接调用 parseInt，那么会将数组元素和索引值都作为参数传入。
``` js
['0', '1', '2'].map(parseInt) // [0, NaN, NaN]
```
而将十进制转换成其他进制时，可以通过 toString 函数来实现。
``` js
(10).toString(2) // "1010"
```

##### 精度问题
``` js
0.1 + 0.2 // 0.30000000000000004
Math.pow(Math.pow(5, 1/2), 2) // 5.000000000000001
```
出现这种情况的原因在于计算的时候，JavaScript 引擎会先将十进制数转换为二进制，然后进行加法运算，再将所得结果转换为十进制。在进制转换过程中如果小数位是无限的，就会出现误差。

对于这个问题的解决方法也很简单，那就是消除无限小数位。

- 一种方式是先转换成整数进行计算，然后再转换回小数，这种方式适合在小数位不是很多的时候。比如一些程序的支付功能 API 以“分”为单位，从而避免使用小数进行计算。
- 还有另一种方法就是舍弃末尾的小数位。比如对上面的加法就可以先调用 toPrecision 截取 12 位，然后调用 parseFloat 函数转换回浮点数。

``` js
parseFloat((0.1 + 0.2).toPrecision(12)) // 0.3
```

#### String

##### 千位分隔符
``` js
function sep(n) {
  let [i, c] = n.toString().split(/(\.\d+)/)
  return i.split('').reverse().map((c, idx) => (idx+1) % 3 === 0 ? ',' + c: c).reverse().join('').replace(/^,/, '') + c
}
```
``` js
function sep2(n){
  let str = n.toString()
  str.indexOf('.') < 0 ? str+= '.' : void 0
  return str.replace(/(\d)(?=(\d{3})+\.)/g, '$1,').replace(/\.$/, '')
}
```

#### Symbol
Symbol 是 ES6 中引入的新数据类型，它表示一个唯一的常量，通过 Symbol 函数来创建对应的数据类型，创建时可以添加变量描述，该变量描述在传入时会被强行转换成字符串进行存储。

##### 避免常量值重复
``` js
const KEY = {
  alibaba: Symbol(),
  baidu: Symbol(),
  ...
  bytedance: Symbol()
}

function getValue(key) {
  switch(key){
    case KEY.alibaba:
      ...
    ...
    case KEY.baidu:
      ...
    case KEY.bytedance:
      ...
  }
}
getValue(KEY.baidu);
```
这种场景下更适合使用 Symbol。不关心值本身，只关心值的唯一性。

##### 避免对象属性覆盖
对传入的对象参数添加一个临时属性 user
``` js
function fn(o) { // {user: {id: xx, name: yy}}
  const s = Symbol()
  o[s] = 'zzz'
  ...
}
```

#### BigInt
在JavaScript中，BigInt 是一种数字类型的数据，它可以表示任意精度格式的整数。而在其他编程语言中，可以存在不同的数字类型，例如:整数、浮点数、双精度数或大斐波数。

可以用在一个整数字面量后面加 n 的方式定义一个 BigInt ，如：10n，或者调用函数BigInt()。

#### 补充：类型转换

JavaScript 这种弱类型的语言，相对于其他高级语言有一个特点，那就是在处理不同数据类型运算或逻辑操作时会强制转换成同一数据类型。

通常强制转换的目标数据类型为 String、Number、Boolean 这三种。下面的表格中显示了 6 种基础数据类型转换关系。
![6 种基础数据类型转换关系](https://s0.lgstatic.com/i/image/M00/17/C1/CgqCHl7XaNOAOR-5AAC7iyHcEyQ034.png)

除了不同类型的转换之外，操作同种数据类型也会发生转换。把基本类型的数据换成对应的对象过程称之为“装箱转换”，反过来，把数据对象转换为基本类型的过程称之为“拆箱转换”。
``` js
var n = 1
var o = new Number(n) // 显式装箱
o.valueOf() // 显式拆箱
n.toPrecision(3) // 隐式装箱, 实际操作：var tmp = new Number(n);tmp.toPrecision(3);tmp = null;
o + 2 // 隐式拆箱，实际操作:var tmp = o.valueOf();tmp + 2;tmp = null;
```


##### 什么时候会触发类型转换？

- 运算相关的操作符包括 +、-、+=、++、* 、/、%、<<、& 等。
- 数据比较相关的操作符包括 >、<、== 、<=、>=、===。
- 逻辑判断相关的操作符包括 &&、!、||、三目运算符。


#### Object

相对于基础类型，引用类型 Object 则复杂很多。简单地说，Object 类型数据就是键值对的集合，键是一个字符串（或者 Symbol） ，值可以是任意类型的值； 复杂地说，Object 又包括很多子类型，比如 Date、Array、Set、RegExp。

对于 Object 类型，我们重点理解一种常见的操作，即深拷贝。

``` js
function clone(obj) {

    // 防止对象类型无限递归调用
    // WeakMap 来记录已经拷贝过的对象，如果当前对象已经被拷贝过，那么直接从 WeakMap 中取出，否则重新创建一个对象并加入 WeakMap 中
  let map = new WeakMap()

  function deep(data) {
    let result = {}

// 把 Symbol 数据类型也考虑进来，所以不能通过 Object.keys 获取键名或 for...in 方式遍历，而是通过 getOwnPropertyNames 和 getOwnPropertySymbols 函数将键名组合成数组，然后进行遍历
    const keys = [...Object.getOwnPropertyNames(data), ...Object.getOwnPropertySymbols(data)]

    // 对于键数组长度为 0 的非 Object 类型的数据可直接返回
    if(!keys.length) return data

    // 如果当前对象已经被拷贝过，那么直接从 WeakMap 中取出
    const exist = map.get(data)
    if (exist) return exist

    // 创建一个对象并加入 WeakMap 中
    map.set(data, result)

    keys.forEach(key => {
      let item = data[key]

        // [undefined, null, true, '', 0, Symbol(), 2n, {}].map(it => typeof it)// ["undefined", "object", "boolean", "string", "number", "symbol", "bigint", "object"]
      if (typeof item === 'object' && item) {
        result[key] = deep(item)
      } else {
        result[key] = item
      }
    })
    return result
  }
  return deep(obj)
}
```
