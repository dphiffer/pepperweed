'use strict';

const User = require('../models/user');

module.exports = {

	http401: async (req, reply, details) => {
		let user = await User.current(req);
		return reply.code(401).view('error.ejs', {
			user: user,
			error: 'Unauthorized',
			details: details
		});
	},

	http404: async (req, reply, details) => {
		let user = await User.current(req);
		return reply.code(404).view('error.ejs', {
			user: user,
			error: 'Not found',
			details: details || 'The resource you requested was not found.'
		});
	}

};
