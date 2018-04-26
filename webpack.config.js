const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
	entry: {
		[path.join("panel", "public")]: [
			"babel-polyfill",
			path.resolve("src", "panel", "assets", "js", "app.js"),
			path.resolve("src", "panel", "assets", "scss", "app.scss")
		],
		[path.join("site", "public")]: [
			"babel-polyfill",
			path.resolve("src", "site", "assets", "js", "app.js"),
			path.resolve("src", "site", "assets", "scss", "app.scss")
		]
	},
	output: {
		filename: path.join("[name]", "js", "app.bundle.js"),
		path: path.resolve(__dirname, "src")
	},
	resolve: {
		alias: { vue$: "vue/dist/vue.esm.js" },
		extensions: [".js", ".vue"]
	},
	module: {
		rules: [{
			test: /\.vue$/,
			loader: "vue-loader"
		}, {
			test: /\.js$/,
			exclude: /(node_modules)/,
			use: { loader: "babel-loader" }
		}, {
			test: /\.scss$/,
			include: [
				/node_modules/,
				path.resolve(__dirname, "src", "panel", "assets", "scss"),
				path.resolve(__dirname, "src", "site", "assets", "scss")
			],
			loader: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: ["css-loader", "sass-loader"]
			})
		}, {
			test: /\.css$/,
			loaders: ["style-loader", "css-loader"]
		}, {
			test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpe?g|gif)$/,
			loader: "file-loader",
			options: {
				name: "[name].[ext]",
				outputPath: "site/public/img/"
			}
		}]
	},
	plugins: [
		new ExtractTextPlugin(path.join("[name]", "css", "app.bundle.css")),
		new webpack.DefinePlugin({ "process.env": { NODE_ENV: `'${process.env.NODE_ENV}'` } }),
		new CopyWebpackPlugin([{
			from: "src/site/assets/img",
			to: "site/public/img"
		}])
	]
};
