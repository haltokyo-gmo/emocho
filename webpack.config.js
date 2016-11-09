var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var plugins = [];
var css_loader = 'css!sass';
if(process.env.NODE_ENV === 'production') {
	plugins = [
		new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
		new webpack.optimize.DedupePlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		})
	];
	css_loader = 'css?minimize!sass';
}

module.exports = [
	{
		entry: path.join(__dirname, 'scripts/index.js'),
		output: {
			filename: 'public/js/script.js'
		},
		resolve: {
			extensions: ['', '.js']
		},
		module: {
			loaders: [
				{
					test: /\.js?$/,
					loader: 'babel',
					query: {
						presets: ['es2015']
					},
					exclude: /node_modules/
				}
			]
		},
		plugins: plugins
	},
	{
		entry: path.join(__dirname, 'styles/style.scss'),
		output: {
			path: path.join(__dirname, 'public/css'),
			filename: 'style.css'
		},
		resolve: {
			extensions: ['', '.scss']
		},
		module: {
			loaders: [
				{
					test: /\.scss$/,
					loader: ExtractTextPlugin.extract('style', css_loader)
				}
			]
		},
		plugins: [
			new ExtractTextPlugin('style.css')
		]
	}
];
