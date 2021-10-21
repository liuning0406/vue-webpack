'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

//host和端口
const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

//dev状态下webpack的一些配置
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    //规则设置是否开启 css 的 sourse map功能，开启了就能很容易定位到某个元素的css的位置
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true
    })
  },
  // cheap-module-eval-source-map is faster for development
  //使用cheap-module-eval-source-map作为调试工具
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    //开发状态下的日志等级
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        //设置默认主界面
        {
          from: /.*/,
          to: path.posix.join(config.dev.assetsPublicPath, 'index.html')
        },
      ],
    },
    hot: true, //热重载
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true, //当他为true的时候，它会对所有服务器资源采用gzip进行压缩。
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser, //在DevServer第一次构建完成时，自动用浏览器打开网页，默认是true
    //该属性是用来在编译出错的时候，在浏览器页面上显示错误
    overlay: config.dev.errorOverlay ?
      {
        warnings: false,
        errors: true
      } :
      false,
    publicPath: config.dev.assetsPublicPath, //配置项用于打开指定 URL 的网页。
    proxy: config.dev.proxyTable, //有一个单独的API后端开发服务器，并且想要在同一个域上发送API请求时，则代理这些 url
    quiet: true, // necessary for FriendlyErrorsPlugin  终端只有启动信息，没有其他的
    //监听文件是否有被修改过
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(), //热重载
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(), //跳过编译时出错的代码使编译后的代码不会发生错误
    // https://github.com/ampedandwired/html-webpack-plugin
    // 根据你提供的html模板生成html
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../static'),
      to: config.dev.assetsSubDirectory,
      ignore: ['.*']
    }])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      // 添加 FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors ?
          utils.createNotifierCallback() :
          undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
