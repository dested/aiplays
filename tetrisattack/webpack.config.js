const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var nodeExternals = require('webpack-node-externals');

module.exports = env => {
  return {
    entry: './src/main.tsx',
    devtool: 'inline-source-map',
    output: {
      publicPath: '/',
    },
    ...(process.env.WEBPACK_SERVE ? {mode: 'development'} : {}),
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css'],
    },
    devServer: {
      contentBase: path.resolve('./'),
      publicPath: '/',
    },
    externals: [
      {
        // 'lodash': 'lodash'
      },
    ],
    plugins: [
      env === 'deploy' && new UglifyJsPlugin(),
      /*
      new MonacoWebpackPlugin({
        languages: ['typescript']
      })
*/
    ].filter((a) => a),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {noEmit: false},
          },
        },
        {
          test: /\.less$/,
          loader: 'less-loader', // compiles Less to CSS
        },
        {
          test: /\.(data)$/,
          use: ['file-loader'],
        },
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader',
        },
        {
          test: /\.(gif|svg|jpg|png)$/,
          loader: 'file-loader',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          loader: 'file-loader',
        },
      ],
    },
  };
};
