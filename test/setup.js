'use strict';

const fs = require('fs');
if (fs.existsSync(process.env.DATABASE)) {
	fs.unlinkSync(process.env.DATABASE);
}
