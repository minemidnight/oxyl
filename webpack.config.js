const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const WebpackMd5Hash = require("webpack-md5-hash");

const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

const folders = ["panel", "site"];
const production = process.env.NODE_ENV === "production";

function createConfig(folder) {
	const config = {
		mode: process.env.NODE_ENV,
		entry: {
			[folder]: [
				"babel-polyfill",
				path.resolve(__dirname, "src", folder, "app", "main.js"),
				path.resolve(__dirname, "src", folder, "app", "main.scss")
			]
		},
		output: {
			chunkFilename: production ? "[id].[chunkhash].js" : "[id].js",
			filename: production ? "app.[chunkhash].js" : "app.js",
			path: path.resolve(__dirname, "src", folder, "public"),
			publicPath: "/"
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
				use: {
					loader: "babel-loader",
					options: {
						presets: ["env"],
						plugins: ["syntax-dynamic-import"],
						comments: false
					}
				}
			}, {
				test: /\.scss$/,
				include: [
					/node_modules/,
					path.resolve(__dirname, "src", folder, "app")
				],
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
			}, {
				test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpe?g|gif)$/,
				loader: "file-loader"
			}]
		},
		plugins: [
			new webpack.DefinePlugin({ "process.env": { NODE_ENV: `'${process.env.NODE_ENV}'` } }),
			new MiniCssExtractPlugin({
				chunkFilename: production ? "[id].[chunkhash].css" : "[id].css",
				filename: production ? "app.[chunkhash].css" : "app.css"
			}),
			new VueLoaderPlugin(),
			new CopyWebpackPlugin([{
				from: path.resolve(__dirname, "src", folder, "app", "static"),
				to: path.resolve(__dirname, "src", folder, "public", "static")
			}]),
			function () {
				this.plugin("done", stats => {
					stats = stats.toJson();
					Object.keys(stats.entrypoints).forEach(entry => {
						const siteFolder = path.resolve(stats.outputPath, entry, "..", "..");
						const jsFile = path.basename(stats.entrypoints[entry].assets.find(asset => path.extname(asset) === ".js"));
						const cssFile = path.basename(stats.entrypoints[entry].assets
							.find(asset => path.extname(asset) === ".css"));

						fs.writeFileSync(path.resolve(siteFolder, "public", "app.html"),
							fs.readFileSync(path.resolve(siteFolder, "app", "index.html"), "utf8")
								.replace("{{css}}", `/${cssFile}`)
								.replace("{{js}}", `/${jsFile}`)
						);
					});
				});
			}
		]
	};

	if(production) {
		config.plugins.push(new UglifyJsPlugin(), new WebpackMd5Hash());
	}

	return config;
}

module.exports = folders.map(createConfig);
