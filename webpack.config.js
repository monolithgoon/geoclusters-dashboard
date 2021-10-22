module.exports = {
	entry: "./server/public/src/js/app.js",
	output: {
		path: __dirname + "/server/public/dist/",
		filename: "bundle.js",
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					"style-loader", // style-loader injects the CSS, that is exported by the < as a > JavaScript module, into a <style> tag at runtime
					"css-loader", // css-loader transforms CSS to a JavaScript module
				],
			},
			// {
			// 	test: /\.css$/,
			// 	use: "file-loader",
			// },
			// {
			// 	test: /\.(svg|jpg|ttf|woff|woff2)$/i,
			// 	loader: "file-loader",
			// 	options: {
			// 		emitFile: false,
			// 		name: "[name].[ext]",
			// 		outputPath: "/assets/fonts",
			// 		// publicPath: "/dist/",
			// 	}
			// },
			{
				test: /\.(svg|jpg|ttf|woff|woff2)$/i,
				type: "asset/resource",
				generator: {
					filename: "./assets/[name][ext]",
				},
			},
		],
	},
};