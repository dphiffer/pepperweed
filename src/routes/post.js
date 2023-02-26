'use strict';

const User = require('../models/user');
const Post = require('../models/post');
const TextPost = require('../models/post/text');
const error = require('./error');

module.exports = (app, opts, done) => {

	app.get('/:user/:post', (req, reply) => {
		app.site.checkUser(req);
		let user = User.load(req.params.user);
		let post = Post.load(req.params.post);
		if (post.user.id != user.id) {
			return error.http404(req, reply);
		}
		post.context = 'view';
		return reply.view('post.ejs', {
			post: post
		});
	});

	app.get('/edit', (req, reply) => {
		let user = app.site.checkUser(req);
		if (! user) {
			return reply.redirect('/login?redirect=/edit');
		}
		return reply.view('edit.ejs', {
			post: {
				id: 'new',
				edit_url: '/new',
				attributes: TextPost.attributes()
			}
		});
	});

	app.post('/new', (req, reply) => {
		let user = app.site.checkUser(req);
		if (! user) {
			return error.http401(req, reply, `Sorry, you need to login before
				you can create a new post.`);
		}
		let post = Post.create(user, 'text');
		post.data.title = req.body.title;
		post.update(req.body);
		post.save();
		if (app.site.options.initialize < 3) {
			app.site.setOption('initialize', 3);
		}
		return reply.redirect(post.url);
	});

	app.get('/edit/:id', async (req, reply) => {
		var user, post, feedback;
		try {
			feedback = 'Sorry, you can’t edit that post.';
			user = await app.site.checkUser(req);
			if (! user) {
				feedback += ` <a href="/login?redirect=${req.url}">Try logging in?</a>`;
			}
			let id = parseInt(req.params.id);
			post = await Post.load(id);
			if (! user || post.user.id != user.id) {
				return error.http404(req, reply, feedback);
			}
			post.context = 'edit';
		} catch (err) {
			return error.http404(req, reply, feedback);
		}
		return reply.view('edit.ejs', {
			post: post
		});
	});

	app.post('/edit/:id', async (req, reply) => {
		var post, user;
		try {
			let id = parseInt(req.params.id);
			post = await Post.load(id);
			user = await app.site.checkUser(req);
			if (! user || post.user.id != user.id) {
				return error.http404(req, reply, `Sorry, you can’t edit that post.`);
			}
		} catch (err) {
			return error.http404(req, reply, `Sorry, you can’t edit that post.`);
		}
		post.data.title = req.body.title;
		post.update(req.body);
		await post.save();
		return reply.redirect(post.url);
	});

	done();

};
