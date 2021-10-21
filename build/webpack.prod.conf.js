'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge') // 一个可以合并数组和对象的插件
const baseWebpackConfig = require('./webpack.base.conf')
// 用于从webpack生成的bundle中提取文本到特定文件中的插件
// 可以抽取出css，js文件将其与webpack输出的bundle分离
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin') // 一个用于生成HTML文件并自动注入依赖文件（link/script）的webpack插件
const ExtractTextPlugin = require('extract-text-webpack-plugin') //如果我们想用webpack打包成一个文件，css js分离开，需要这个插件
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const glob = require('glob')
const env = process.env.NODE_ENV === 'testing' ?
  require('../config/test.env') :
  require('../config/prod.env')

// 合并基础的webpack配置
const webpackConfig = merge(baseWebpackConfig, {
  // 配置样式文件的处理规则，使用styleLoaders
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  // 开启source-map，生产环境下推荐使用cheap-source-map或source-map，后者得到的.map文件体积比较大，但是能够完全还原以前的js代码
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot, // 编译输出目录
    filename: utils.assetsPath('js/[name].[chunkhash].js'), // 编译输出文件名格式
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js') // 没有指定输出名的文件输出的文件名格式
  },
  /*   vue: { // vue里的css也要单独提取出来
      loaders: utils.cssLoaders({ // css加载器，调用了utils文件中的cssLoaders方法,用来返回针对各类型的样式文件的处理方式,
        sourceMap: config.build.productionSourceMap,
        extract: true
      })
    }, */

  // 重新配置插件项
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    // 位于开发环境下
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new UglifyJsPlugin({ // 丑化压缩代码
      uglifyOptions: {
        output: {
          // 最紧凑的输出
          beautify: false,
          // 删除所有的注释
          comments: false
        },
        compress: {
          // 在UglifyJs删除没有用到的代码时不输出警告
          warnings: false,
          // 删除所有的 debugger
          drop_debugger: true,
          // 删除所有的 `console` 语句，可以兼容ie浏览器
          drop_console: false, //true
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'), // 抽离css文件
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.

    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap ?
        {
          safe: true,
          map: {
            inline: false
          }
        } :
        {
          safe: true
        }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    // filename 生成网页的HTML名字，可以使用/来控制文件文件的目录结构，最
    // 终生成的路径是基于webpac配置的output.path的
    new HtmlWebpackPlugin({
      // 生成html文件的名字，路径和生产环境下的不同，要与修改后的publickPath相结合，否则开启服务器后页面空白
      filename: process.env.NODE_ENV === 'testing' ?
        'index.html' :
        config.build.index,
      // 源文件，路径相对于本文件所在的位置
      template: 'index.html',
      inject: true, // 要把<script>标签插入到页面哪个标签里(body|true  OR  head|false)
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting

    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file

    // 如果文件是多入口的文件，可能存在，重复代码，把公共代码提取出来，又不会重复下载公共代码了
    // （多个页面间会共享此文件的缓存）
    // CommonsChunkPlugin的初始化常用参数有解析？
    // name: 这个给公共代码的chunk唯一的标识
    // filename，如何命名打包后生产的js文件，也是可以用上[name]、[hash]、[chunkhash]
    // minChunks，公共代码的判断标准：某个js模块被多少个chunk加载了才算是公共代码
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      name: 'manifest',
      minChunks(module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest', // 为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    // copy custom static assets
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../static'),
      to: config.build.assetsSubDirectory,
      ignore: ['.*']
    }]),
  ]
})

// gzip模式下需要引入compression插件进行压缩
// TODO: 基础单页面配置
if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

//#region   TODO: 多页面配置
function getEntry(globPath) {
  var entries = {},
    basename, tmp, pathname;

  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry));
    tmp = entry.split('/').splice(-3);
    pathname = tmp.splice(1, 1) + '/' + basename; // 正确输出js和html的路径
    entries[pathname] = entry;
  });
  return entries;
}

var pages = getEntry('./src/module/**/*.html');

for (var pathname in pages) {
  var conf = {
    filename: pathname + '.html',
    template: pages[pathname],
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
      // more options:
      // https://github.com/kangax/html-minifier#options-quick-reference
    },
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency',
    excludeChunks: Object.keys(pages).filter(item => {
      return (item != pathname)
    })
  };

  webpackConfig.plugins.push(new HtmlWebpackPlugin(conf));
}

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}

//#endregion 多页面配置 end

module.exports = webpackConfig
