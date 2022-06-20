'use strict';

import fs from 'fs';

if (fs.existsSync(process.env.DATABASE)) {
	fs.unlinkSync(process.env.DATABASE);
}
