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

#### Tree Shaking

``` js
// ./webpack.config.js
module.exports = {
  // ... 其他配置项
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,
    // 压缩输出结果
    minimize: true
  }
}
```
- usedExports - 打包结果中只导出外部用到的成员；
- minimize - 压缩打包结果。


- usedExports 的作用就是标记树上哪些是枯树枝、枯树叶
- minimize 的作用就是负责把枯树枝、枯树叶摇下来。

Tree-shaking 实现的前提是 ES Modules，也就是说：最终交给 Webpack 打包的代码，必须是使用 ES Modules 的方式来组织的模块化。

经过 babel-loader  Tree-shaking babel 失效？
``` js
// ./webpack.config.js
module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              // modules 属性设置为 false，确保不会转换 ES Modules
              ['@babel/preset-env', { modules: false }]
            ]
          }
        }
      }
    ]
  },
  optimization: {
    usedExports: true
  }
}

```

#### 合并模块（扩展）
普通打包只是将一个模块最终放入一个单独的函数中，如果我们的模块很多，就意味着在输出结果中会有很多的模块函数。

concatenateModules 配置的作用就是尽可能将所有模块合并到一起输出到一个函数中，这样既提升了运行效率，又减少了代码的体积。
``` js
// ./webpack.config.js
module.exports = {
  // ... 其他配置项
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,
    // 尽可能合并每一个模块到一个函数中
    concatenateModules: true,
    // 压缩输出结果
    minimize: false
  }
}
```

#### sideEffects
Tree-shaking 只能移除没有用到的代码成员，而想要完整移除没有用到的模块，那就需要开启 sideEffects 特性了。

Webpack 4 中新增了一个 sideEffects 特性，它允许我们通过配置标识我们的代码是否有副作用，从而提供更大的压缩空间。

``` js
// ./src/components/index.js
export { default as Button } from './button'
export { default as Link } from './link'
export { default as Heading } from './heading'

```
开启sideEffects 
``` js
// ./webpack.config.js
module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js'
  },
  optimization: {
    sideEffects: true
  }
}
```
那此时 Webpack 在打包某个模块之前，会先检查这个模块所属的 package.json 中的 sideEffects 标识
``` js
{
  "name": "09-side-effects",
  "version": "0.1.0",
  "author": "zce <w@zce.me> (https://zce.me)",
  "license": "MIT",
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "^4.43.0",
    "webpack-cli": "^3.3.11"
  },
// 这样就表示我们这个项目中的所有代码都没有副作用，让 Webpack 放心大胆地去“干”
  "sideEffects": false
}
```
保留副作用代码文件
``` js
{
  "name": "09-side-effects",
  "version": "0.1.0",
  "author": "zce <w@zce.me> (https://zce.me)",
  "license": "MIT",
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "^4.43.0",
    "webpack-cli": "^3.3.11"
  },
  // 标识需要保留副作用的模块路径（可以使用通配符）
  "sideEffects": [
    "./src/extend.js",
    "*.css"
  ]
}

```
sideEffects 注意
``` js
// ./src/extend.js
// 为 Number 的原型添加一个扩展方法
Number.prototype.pad = function (size) {
  const leadingZeros = Array(size + 1).join(0)
  return leadingZeros + this
}

```
这里为 Number 类型做扩展的操作就是 extend 模块对全局产生的副作用。


#### Code Splitting（分块打包）
Webpack 实现分包的方式主要有两种：

- 根据业务不同配置多个打包入口，输出多个打包结果；
- 结合 ES Modules 的动态导入（Dynamic Imports）特性，按需加载模块。


 ##### 多入口打包
 ``` js
// ./webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  entry: {
    index: './src/index.js',
    album: './src/album.js'
  },
  output: {
    filename: '[name].bundle.js' // [name] 是入口名称
  },
  optimization: {
    splitChunks: {
      // 自动提取所有公共模块到单独 bundle
      chunks: 'all'
    }
  }
  // ... 其他配置
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Multi Entry',
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index'] // 指定使用 index.bundle.js
    }),
    new HtmlWebpackPlugin({
      title: 'Multi Entry',
      template: './src/album.html',
      filename: 'album.html',
      chunks: ['album'] // 指定使用 album.bundle.js
    })
  ]
}

 ```

 ##### 动态导入

 ``` js
// ./src/index.js
// import posts from './posts/posts'
// import album from './album/album'
const update = () => {
  const hash = window.location.hash || '#posts'
  const mainElement = document.querySelector('.main')
  mainElement.innerHTML = ''
  if (hash === '#posts') {
    // mainElement.appendChild(posts())
    import('./posts/posts').then(({ default: posts }) => {
      mainElement.appendChild(posts())
    })
  } else if (hash === '#album') {
    // mainElement.appendChild(album())
    import('./album/album').then(({ default: album }) => {
      mainElement.appendChild(album())
    })
  }
}
window.addEventListener('hashchange', update)
update()

 ```

 > P.S. 为了动态导入模块，可以将 import 关键字作为函数调用。当以这种方式使用时，import 函数返回一个 Promise 对象。这就是 ES Modules 标准中的 [Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports)。


 整个过程我们无需额外配置任何地方，只需要按照 ES Modules 动态导入的方式去导入模块就可以了，Webpack 内部会自动处理分包和按需加载。


##### 魔法注释

在 import 函数的形式参数位置，添加一个行内注释，这个注释有一个特定的格式：webpackChunkName: ''，这样就可以给分包的 chunk 起名字了
``` js
// 魔法注释
import(/* webpackChunkName: 'posts' */'./posts/posts')
  .then(({ default: posts }) => {
    mainElement.appendChild(posts())
  })

```
如果你的 chunkName 相同的话，那相同的 chunkName 最终就会被打包到一起，例如我们这里可以把这两个 chunkName 都设置为 components，然后再次运行打包，那此时这两个模块都会被打包到一个文件中


#### 不同环境下的配置

我们先为不同的工作环境创建不同的 Webpack 配置。创建不同环境配置的方式主要有两种：

- 在配置文件中添加相应的判断条件，根据环境不同导出不同配置。
- 为不同环境单独添加一个配置文件，一个环境对应一个配置文件。


根据环境不同导出不同配置
``` js
// ./webpack.config.js
module.exports = (env, argv) => {
  const config = {
    // ... 不同模式下的公共配置
  }
  
  if (env === 'development') {
    // 为 config 添加开发模式下的特殊配置
    config.mode = 'development'
    config.devtool = 'cheap-eval-module-source-map'
  } else if (env === 'production') {
    // 为 config 添加生产模式下的特殊配置
    config.mode = 'production'
    config.devtool = 'nosources-source-map'
  }
  
  return config
}
```

安装
```  bash
$ npm i webpack-merge --save-dev 
# or yarn add webpack-merge --dev
```

不同环境的配置文件
``` js
// ./webpack.common.js
module.exports = {
  // ... 公共配置
}
// ./webpack.prod.js
const merge = require('webpack-merge')
const common = require('./webpack.common')
module.exports = merge(common, {
  // 生产模式配置
})
// ./webpack.dev.jss
const merge = require('webpack-merge')
const common = require('./webpack.common')
module.exports = merge(common, {
  // 开发模式配置
})
```


#### 生产模式下的优化插件

##### Define Plugin
``` js
// ./webpack.config.js
const webpack = require('webpack')
module.exports = {
  // ... 其他配置
  plugins: [
    new webpack.DefinePlugin({
      // 值要求的是一个代码片段
      API_BASE_URL: '"https://api.example.com"'
    })
  ]
}
```

``` js
// ./src/main.js
console.log(API_BASE_URL)

```
![](https://s0.lgstatic.com/i/image/M00/10/F5/CgqCHl7LaH-AMPKrAADQsK6wHzM717.png)


##### Mini CSS Extract Plugin

``` js
// ./webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
module.exports = {
  mode: 'none',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: '[name].bundle.js'
  },
  optimization: {
    minimizer: [
      // Webpack 认为我们需要使用自定义压缩器插件，那内部的 JS 压缩器就会被覆盖掉。我们必须手动再添加回来
      // 内置的 JS 压缩插件叫作 terser-webpack-plugin
      new TerserWebpackPlugin(),
      // 用这个插件来压缩我们的样式文件。
      new OptimizeCssAssetsWebpackPlugin()
    ]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 使用 MiniCssExtractPlugin 中提供的 loader 去替换掉 style-loader，以此来捕获到所有的样式
          // 'style-loader', // 将样式通过 style 标签注入
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // 将 CSS 代码从打包结果中提取出来的插件
    new MiniCssExtractPlugin()
  ]
}
```



------------------------------------

*拉勾教育学习笔记，非原创。*