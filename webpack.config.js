const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, 'server', 'public', 'src'),
  entry: './js/app.js',
  output: {
    path: path.resolve(__dirname, 'server', 'public', 'dist'),
    filename: 'bundle.js',
    assetModuleFilename: 'assets/[name][ext][query]',
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!assets/**/*'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        generator: {
          filename: 'assets/images/[name][ext][query]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
      },
      {
        test: /\.(ttf|woff|woff2)$/i,
        type: 'asset',
        generator: {
          filename: 'assets/fonts/[name][ext][query]',
        },
      },
    ],
  },
};
