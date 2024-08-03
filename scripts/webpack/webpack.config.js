const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserJSPlugin = require('terser-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');


const entry = require('./entry');
const {
  MODULES_PATH,
  VENDORS_NAME,
  RUNTIME_NAME,
  EXPOSES_PATH,
  SRC_PATH,
  SCRIPTS_PATH
} = require('../constants');

const config = require('../config');
let vueFile = 'vue.js';

if (config.useMediawikiVue) {
  vueFile = `mediawiki.${vueFile}`;
}

module.exports = {
  mode: 'production',
  entry,
  output: {
    path: MODULES_PATH,
    filename: '[name].js',
    library: {
      type: 'commonjs2',
    },
  },
  resolve: {
    alias: {
      '@exposes': EXPOSES_PATH,
      '@src': SRC_PATH,
      vue$: path.join(SCRIPTS_PATH, 'vue', vueFile),
    },
    extensions: ['.js', '.vue', '.json', '.wasm'],
  },
  optimization: {
    runtimeChunk: {
      name: RUNTIME_NAME,
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](?=.*\.js$)/,
          name: VENDORS_NAME,
          chunks: 'all'
        },
      },
    },
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserJSPlugin()]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: "[name].css" })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ],
      },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader",
        ],
      },
    ],
  }
}
