const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/js13k/index.js',
  mode: 'production',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './js13k'),
  },
  devServer: {
    contentBase: './js13k',
  },
  plugins: [new HtmlWebpackPlugin({
    template: './src/js13k/index.html',
    filename: 'index.html',
  })],
};
