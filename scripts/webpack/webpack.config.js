const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserJSPlugin = require('terser-webpack-plugin');

const entry = require('./entry');
const { MODULES_PATH, VENDORS_NAME, RUNTIME_NAME } = require('../constants');

const config = {
  mode: 'production',
  entry,
  output: {
    path: MODULES_PATH,
    filename: '[name].js',
    library: {
      type: 'commonjs2',
    },
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
  plugins: [new MiniCssExtractPlugin({
    filename: "[name].css",
  })],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
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

module.exports = config;
