// Import the necessary modules
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Export the Webpack configuration object
module.exports = {

  // Set the root directory of the application as the context
  context: path.resolve(__dirname, 'server', 'public', 'src'),

  // Set the entry point for the application
  entry: './js/app.js',

  // Set the output directory and the name of the output file
  output: {
    path: path.resolve(__dirname, 'server', 'public', 'dist'),
    filename: 'bundle.js',

    // Set the asset file name for all static assets (images, fonts, etc.)
    assetModuleFilename: 'assets/[name][ext][query]',
  },

  // Define the plugins used by the configuration
  plugins: [

    // Use the CleanWebpackPlugin to remove the contents of the output directory
    // before building the application, excluding the assets directory
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!assets/**/*'],
    }),

    //  Copy files and directories as part of the Webpack build process
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets/icons', to: 'assets/icons' },
      ],
    }),
  ],

  // Define the loaders used to process specific types of files
  module: {
    rules: [

      // Use the css-loader and style-loader to handle CSS files
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          // REMOVE -> CAUSING ERRORS -> DOES NOT SEEM TO BE NEEDED
          // Use the `url-loader` to load images in .css files
          // {
          //   loader: 'url-loader',
          //   options: {
          //     limit: 8192, // Convert images < 8kb to base64 strings
          //     name: 'assets/images/[name].[ext]',
          //     publicPath: '../', // Fix relative paths in CSS
          //   },
          // },
        ],
      },

      // Use the asset loader to handle image files
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        generator: {
          // Set the filename for processed image files
          filename: 'assets/images/[name][ext][query]',
        },
        parser: {
          // Set the data URL condition for image files
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
      },

      // Use the asset loader to handle font files
      {
        test: /\.(ttf|woff|woff2)$/i,
        type: 'asset',
        generator: {
          // Set the filename for processed font files
          filename: 'assets/fonts/[name][ext][query]',
        },
      },

      // Use the asset loader to handle icon files
      {
        test: /\.(png|svg)$/i,
        // Specify that only files located in the `server/public/src/assets/icons` directory should be processed by the rule
        include: path.resolve(__dirname, 'server', 'public', 'src', 'assets', 'icons'),
        type: 'asset',
        generator: {
          // Set the filename for processed icon files
          filename: 'assets/icons/[name][ext][query]',
        },
        parser: {
          // Set the data URL condition for icon files
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
      },
    ],
  },
}; 
