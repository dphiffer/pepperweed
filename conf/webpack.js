'use strict';

import path from 'path';
import { fileURLToPath } from 'url';

let __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

export default {
	entry: './src/assets/js/main.js',
	output: {
		path: path.resolve(path.dirname(__dirname), 'static/'),
		filename: 'main.js',
	},
	stats: 'errors-only'
};
