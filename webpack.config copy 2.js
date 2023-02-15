const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: "./server/public/src/js/app.js",
	output: {
		path: __dirname + "/server/public/dist/",
		filename: "bundle.js",
	},
	plugins: [new CleanWebpackPlugin()], // CleanWebpackPlugin automatically removes the contents of the public/dist directory before each build.
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					"style-loader", // style-loader injects the CSS, that is exported by the < as a > JavaScript module, into a <style> tag at runtime
					"css-loader", // css-loader transforms CSS to a JavaScript module
				],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				use: [
					{
						loader: "url-loader",
						options: {
							// limit: 8192, // limit the file size to 8KB
							name: "[name].[ext]",
							outputPath: "assets/images/", // output path for the images
						},
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				type: "asset/resource",
				generator: {
					filename: "./assets/images/[name][ext]",
				},
			},
			{
				test: /\.(ttf|woff|woff2)$/i,
				type: "asset/resource",
				generator: {
					filename: "./assets/fonts/[name][ext]",
				},
			},
		],
	},
};
