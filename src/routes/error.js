'use strict';

import User from '../models/user.js';

let errors = {};
let codes = {
	400: 'Bad request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not found'
};

for (let code in codes) {
	errors[`http${code}`] = async (req, reply, details) => {
		let user = await User.current(req);
		return reply.code(code).view('error.ejs', {
			user: user,
			error: codes[code],
			details: details
		});
	};
}

export default errors;
