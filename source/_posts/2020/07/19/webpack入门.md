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

#### webpack插件机制
应用场景
- 实现自动在打包之前清除 dist 目录（上次的打包结果）；
- 自动生成应用所需要的 HTML 文件；
- 根据不同环境为代码注入类似 API 地址这种可能变化的部分；
- 拷贝不需要参与打包的资源文件到输出目录；
- 压缩 Webpack 打包完成后输出的文件；
- 自动发布打包结果到服务器实现自动部署。

#### 开发一个插件

自动清除 Webpack 打包结果中的注释
``` js
// ./remove-comments-plugin.js
class RemoveCommentsPlugin {
  apply (compiler) {
    compiler.hooks.emit.tap('RemoveCommentsPlugin', compilation => {
      // compilation => 可以理解为此次打包的上下文
      for (const name in compilation.assets) {
        if (name.endsWith('.js')) {
          const contents = compilation.assets[name].source()
          const noComments = contents.replace(/\/\*{2,}\/\s?/g, '')
          compilation.assets[name] = {
            source: () => noComments,
            size: () => noComments.length
          }
        }
      }
    })
  }
}

```

#### webpack 工作过程关键环节
1. Webpack CLI 启动打包流程；
1. 载入 Webpack 核心模块，创建 Compiler 对象；
1. 使用 Compiler 对象开始编译整个项目；
1. 从入口文件开始，解析模块依赖，形成依赖关系树；
1. 递归依赖树，将每个模块交给对应的 Loader 处理；
1. 合并 Loader 处理完的结果，将打包结果输出到 dist 目录。

#### Source Map
Source Map 不同模块对比表
![Source Map 不同模块对比表](https://s0.lgstatic.com/i/image/M00/07/35/Ciqc1F65B2aAGTvVAANPGIkqtEY706.png)
开发环境下建议选择 cheap-module-eval-source-map
生产环境下建议选择 none  或者  nosources-source-map


#### 模块热替换
开启 HMR（Hot Module Replacement）
1. 首先需要将 devServer 对象中的 hot 属性设置为 true；
1. 然后需要载入一个插件，这个插件是 webpack 内置的一个插件，所以我们先导入 webpack 模块，有了这个模块过后，这里使用的是一个叫作 HotModuleReplacementPlugin 的插件
``` js
// ./webpack.config.js
const webpack = require('webpack')

module.exports = {
  // ...
  devServer: {
    // 开启 HMR 特性，如果资源不支持 HMR 会 fallback 到 live reloading
    hot: true
    // 只使用 HMR，不会 fallback 到 live reloading
    // hotOnly: true
  },
  plugins: [
    // ...
    // HMR 特性所需要的插件
    new webpack.HotModuleReplacementPlugin()
  ]
}
```
JS 模块热替换 并保持状态
``` js
// ./main.js
import createEditor from './editor'

const editor = createEditor()
document.body.appendChild(editor)

// ... 原本的业务代码

// HMR --------------------------------
let lastEditor = editor
module.hot.accept('./editor', () => {
  // 当 editor.js 更新，自动执行此函数
  // 临时记录更新前编辑器内容
  const value = lastEditor.innerHTML
  // 移除更新前的元素
  document.body.removeChild(lastEditor)
  // 创建新的编辑器
  // 此时 createEditor 已经是更新过后的函数了
  lastEditor = createEditor()
  // 还原编辑器内容
  lastEditor.innerHTML = value
  // 追加到页面
  document.body.appendChild(lastEditor)
})

```
图片热替换
``` js
// ./src/main.js
import logo from './icon.png'
// ... 其他代码
module.hot.accept('./icon.png', () => {
  // 当 icon.png 更新后执行
  // 重写设置 src 会触发图片元素重新加载，从而局部更新图片
  img.src = logo
})

```
热替换只使用 HMR，不 fallback 到 live reloading 配置
``` js
// ./webpack.config.js
const webpack = require('webpack')

module.exports = {
  // ...
  devServer: {
    // 只使用 HMR，不会 fallback 到 live reloading
    hotOnly: true
  },
  plugins: [
    // ...
    // HMR 特性所需要的插件
    new webpack.HotModuleReplacementPlugin()
  ]
}

```
未开启HMR兼容处理
``` js
// HMR -----------------------------------
if (module.hot) { // 确保有 HMR API 对象
  module.hot.accept('./editor', () => {
    // ...
  })
}

```


------------------------------------

*拉勾教育学习笔记，非原创。*