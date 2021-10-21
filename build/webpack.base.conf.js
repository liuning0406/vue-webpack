'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const glob = require('glob')
const webpack = require('webpack')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}
//eslint的配置
const createLintingRule = () => ({

  test: /\.(js|vue)$/, //对.js和.vue结尾的文件进行eslint
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})
//TODO: 多页面配置 begin
var entries = getEntry('./src/module/**/*.js'); // 获得入口js文件
function getEntry(globPath) {
  var entries = {},
    basename, tmp, pathname;

  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    if (entry.indexOf('/router/') <= -1) {
      tmp = entry.split('/').splice(-3);
      pathname = tmp.splice(1, 1) + '/' + basename; // 正确输出js和html的路径
      entries[pathname] = ['babel-polyfill', entry];
      //entries.push(entry)
    }
  });
  return entries;
}
//多页面配置 end
module.exports = {
  context: path.resolve(__dirname, '../'),
  // webpack入口文件
  entry: {
    app: './src/main.js' //多页面时此处配置变量 entries
  },
  // webpack输出路径和命名规则
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ?
      config.build.assetsPublicPath : config.dev.assetsPublicPath
  },
  // 模块resolve的规则
  resolve: {
    // 取别名，方便引用模块，例如有了别名之后
    // import Vue from 'vue/dist/vue.common.js'可以写成 import Vue from 'vue'
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      // 也可以自己添加一些经常引用的路径
      // '~': resolve('static')
    }
  },
  // 不同类型模块的处理规则
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      { // 对所有.vue文件使用vue-loader进行编译
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      { // 对所有.js文件使用babel-loader进行编译
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      { // 对图片资源文件使用url-erload
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000, // 小于10k 的图片转成base64编码的dataURL字符串写到代码中
          name: utils.assetsPath('img/[name].[hash:7].[ext]') // 其他的图片转移到静态资源文件夹
        }
      },
      { // 对多媒体文件使用url-loader
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      { // 对字体资源文件使用url-loader
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // 防止Webpack因为Vue而注入无用的setImmediate polyfill
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
