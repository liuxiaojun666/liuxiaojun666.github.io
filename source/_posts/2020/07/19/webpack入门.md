---
title: webpack入门
date: 2020-07-19 20:29:25
tags: 前端,webpack入门,webpack,loader
---

#### webpack配置代码提示
``` js
// ./webpack.config.js
/** @type {import('webpack').Configuration} */
const config = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  }
}
module.exports = config
```

#### loader机制
Webpack 默认按照 JS 语法解析模块

##### webpack加载css模块
``` bash
$ npm install css-loader --save-dev 
# or yarn add css-loader --dev
```
``` js
// ./src/webpack.config.js
module.exports = {
  entry: './src/main.css',
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/, // 根据打包过程中所遇到文件路径匹配是否使用这个 loader
        use: 'css-loader' // 指定具体的 loader
      }
    ]
  }
}
```
css-loader 只会把 CSS 模块加载到 JS 代码中，而并不会使用这个模块。
``` js
// ./src/webpack.config.js
module.exports = {
  entry: './src/main.css',
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        // 对同一个模块使用多个 loader，注意顺序
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
}
```
style-loader 的作用总结一句话就是，将 css-loader 中所加载到的所有样式模块，通过创建 style 标签的方式添加到页面上。

**一旦配置多个 Loader，执行顺序是从后往前执行的，所以这里一定要将 css-loader 放在最后，因为必须要 css-loader 先把 CSS 代码转换为 JS 模块，才可以正常打包**

#### 常用loader

| 名称              |   	链接        |
| ----              |   	----        |
| file-loader       |	https://webpack.js.org/loaders/file-loader      |
| url-loader        |	https://webpack.js.org/loaders/url-loader       |
| babel-loader      |	https://webpack.js.org/loaders/babel-loader     |
| style-loader      |	https://webpack.js.org/loaders/style-loader     |
| css-loader        |	https://webpack.js.org/loaders/css-loader       |
| sass-loader       |	https://webpack.js.org/loaders/sass-loader      |
| postcss-loader    |	https://webpack.js.org/loaders/postcss-loader       |
| eslint-loader     |	https://github.com/webpack-contrib/eslint-loader        |
| vue-loader        |	https://github.com/vuejs/vue-loader     |

#### 开发一个 Loader
```
 └─ 03-webpack-loader ······················· sample root dir
    ├── src ································· source dir
    │   ├── about.md ························ markdown module
    │   └── main.js ························· entry module
    ├── package.json ························ package file
+   ├── markdown-loader.js ·················· markdown loader
    └── webpack.config.js ··················· webpack config file

```
``` md
<!-- ./src/about.md -->
# About

this is a markdown file.
```
``` js
// ./src/main.js
import about from './about.md'

console.log(about)
// 希望 about => '<h1>About</h1><p>this is a markdown file.</p>'

```
**每个 Webpack 的 Loader 都需要导出一个函数，这个函数就是我们这个 Loader 对资源的处理过程，它的输入就是加载到的资源文件内容，输出就是我们加工后的结果。**
``` js
// ./markdown-loader.js
const marked = require('marked')

module.exports = source => {
  // 1. 将 markdown 转换为 html 字符串
  const html = marked(source)
  // html => '<h1>About</h1><p>this is a markdown file.</p>'
  // 2. 将 html 字符串拼接为一段导出字符串的 JS 代码
  const code = `module.exports = ${JSON.stringify(html)}`
  return code 
  // code => 'export default "<h1>About</h1><p>this is a markdown file.</p>"'
}
```


------------------------------------

*拉勾教育学习笔记，非原创。*