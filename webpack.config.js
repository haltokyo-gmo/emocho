var webpack = require('webpack');
var path = require('path');
var Promise = require('es6-promise').Promise;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var bowerResolver = new webpack.ResolverPlugin(
	new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
);

var plugins = [
	bowerResolver
];
var css_loader = 'css!sass';
if(process.env.NODE_ENV === 'production') {
	plugins = [
		new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
		new webpack.optimize.DedupePlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		bowerResolver
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
			modulesDirectories: [
				'node_modules',
				'bower_components'
			],
			extensions: ['', '.js']
		},
		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /node_modules|bower_components/,
					loader: 'babel',
					query: {
						presets: ['es2015']
					},
					exclude: /node_modules/
				},
				{
					test: /bower_components(\/|\\)(PreloadJS|SoundJS|EaselJS|TweenJS)(\/|\\).*\.js$/,
					loader: 'imports?this=>window!exports?window.createjs'
				}
			]
		},
		plugins: plugins,
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
