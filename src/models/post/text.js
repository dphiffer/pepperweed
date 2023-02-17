'use strict';

const marked = require('marked');
const Post = require('../post');

class TextPost extends Post {

	get content() {
		if (this.attributes.values &&
		    this.attributes.values.parsedContent) {
			return this.attributes.values.parsedContent;
		}
		return '';
	}

	static attributes() {
		return {
			name: 'Text',
			type: 'text',
			fields: [
				{
					type: 'textarea',
					label: 'Content',
					key: 'content'
				}
			],
			values: {}
		};
	}

	init(attributes) {
		if (attributes.values && attributes.values.content) {
			attributes.values.parsedContent = marked.parse(attributes.values.content);
		}
		this.attributes = attributes;
	}

	async update(formData) {
		let parsedContent = null;
		if (formData.content) {
			parsedContent = marked.parse(formData.content);
		}
		this.attributes.values = {
			content: formData.content,
			parsedContent: parsedContent
		};
		await this.save();
	}
}

Post.registerType('text', TextPost);
module.exports = TextPost;
