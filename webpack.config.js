const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
	entry: [
		"babel-polyfill",
		path.resolve("src", "panel", "assets", "js", "app.js"),
		path.resolve("src", "panel", "assets", "scss", "app.scss")
	],
	output: {
		filename: "app.bundle.js",
		path: path.resolve(__dirname, "src", "panel", "public", "js")
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
			include: [/node_modules/, path.resolve(__dirname, "src", "panel", "assets", "scss")],
			loader: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: ["css-loader", "sass-loader"]
			})
		}, {
			test: /\.css$/,
			loaders: ["style-loader", "css-loader"]
		}, {
			test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpe?g|gif)$/,
			use: ["file-loader"]
		}]
	},
	plugins: [
		new ExtractTextPlugin(path.relative(
			path.resolve(__dirname, "src", "panel", "public", "js"),
			path.resolve(__dirname, "src", "panel", "public", "css", "app.bundle.css")
		)),
		new webpack.DefinePlugin({ "process.env": { NODE_ENV: `'${process.env.NODE_ENV}'` } })
	]
};
