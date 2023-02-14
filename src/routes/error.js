'use strict';

let errors = {};
let codes = {
	400: 'Bad request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not found'
};

for (let code in codes) {
	errors[`http${code}`] = async (req, reply, details) => {
		return reply.code(code).view('error.ejs', {
			error: codes[code],
			details: details
		});
	};
}

module.exports = errors;
