var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/main.js',
  // entry: {
  //     build: './src/main.js',
  //     vendors:['d3', 'vue', 'bootstrap-webpack']
  // },
  output: {
    path: path.resolve(__dirname, './dist'),
    // publicPath: '/dist/',
    publicPath: 'js/', //尝试修正webfont图片无法获取问题，项目服务器文件目录为js
    // publicPath: './develop/', //尝试修正webfont图片无法获取问题，项目服务器文件目录为develop
    // filename: 'build.js'
    filename: 'develop.js'
    // filename: '[name].[hash].js'
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
      loaders: [
        {
          test: /\.vue$/,
          loader: 'vue'
        },
        {
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/
        },
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
            test: /\.css$/, loader: 'style!css'
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'url',
          query: {
            limit: 10000,
            name: '[name].[ext]?[hash]'
          }
        },
        { test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery' },
        { test: /\.(woff|woff2)$/,  loader: "url-loader?limit=10000&mimetype=application/font-woff" },
        { test: /\.ttf$/,    loader: "file-loader" },
        { test: /\.eot$/,    loader: "file-loader" }
      ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  devtool: 'eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = 'source-map'
  // http://vuejs.github.io/vue-loader/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  ])
}
