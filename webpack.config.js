var path = require("path");
var Promiss = require("es6-promise").Promise;
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var autoprefixer = require('autoprefixer');

var plugins = [];
var cssLoader = "css!postcss!sass";

if(process.env.NODE_ENV === "production" || true) {
	plugins = [
		new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
		new webpack.optimize.DedupePlugin(),
		new webpack.DefinePlugin({"process.env": {"NODE_ENV": JSON.stringify("production")}}),
	]
	cssLoader = "css?minimize!postcss!sass";
}

module.exports = [
	{
		entry: path.join(__dirname, "scripts", "index.js"),
		output: {
			path: path.join(__dirname, "public/js"),
			filename: "script.js"
		},
		resolve: {
			modulesDirectories: ["node_modules"],
			extensions: ["", ".js"]
		},
		module: {
			loaders: [{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel",
				query: {presets: ["es2015"]}
			}]
		},
		devtool: "source-map",
		plugins: plugins
	},
	{
		entry: path.join(__dirname, "styles", "index.scss"),
		output: {
			path: path.join(__dirname, "public/css"),
			filename: "style.css"
		},
		resolve: {
			modulesDirectories: ["node_modules"],
			extensions: ["", ".css", ".scss"]
		},
		module: {
			loaders: [{
				test: /\.s?css$/,
				exclude: /node_modules/,
				loader: ExtractTextPlugin.extract("style", cssLoader)
			}]
		},
		devtool: "source-map",
		plugins: [new ExtractTextPlugin("style.css")],
		postcss: [autoprefixer({browsers: ["last 2 versions", "ie >= 9", "Android >= 4", "ios_saf >= 8"]})]
	}
]
