'use strict';

const db = require('../src/db');
const fs = require('fs');

if (fs.existsSync(process.env.DATABASE)) {
	fs.unlinkSync(process.env.DATABASE);
}

const site = require('../src/models/site');
site.setOption('initialize', 3);
