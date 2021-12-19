'use strict';

const path = require("path");

module.exports = {
	entry: './src/assets/js/main.js',
	output: {
		path: path.resolve(path.dirname(__dirname), 'public/'),
		filename: 'main.js',
	},
	stats: 'errors-only'
};
