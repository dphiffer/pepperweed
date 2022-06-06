'use strict';

const User = require('../models/user');

module.exports = {

	http400: async (req, reply, details) => {
		let user = await User.current(req);
		return reply.code(400).view('error.ejs', {
			user: user,
			error: 'Bad request',
			details: details || 'Your request included invalid input.'
		});
	},

	http401: async (req, reply, details) => {
		let user = await User.current(req);
		return reply.code(401).view('error.ejs', {
			user: user,
			error: 'Unauthorized',
			details: details || 'You are not authorized to do that.'
		});
	},

	http403: async (req, reply, details) => {
		let user = await User.current(req);
		return reply.code(403).view('error.ejs', {
			user: user,
			error: 'Forbidden',
			details: details || 'You are not authorized to do that.'
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
