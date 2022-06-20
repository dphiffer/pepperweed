'use strict';

const marked = require('marked');
const Post = require('../post');

class TextPost extends Post {

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

	initAttributes(attributes) {
		if (attributes.values.content) {
			attributes.values.parsedContent = marked.parse(attributes.values.content);
		}
		this.attributes = attributes;
	}

	updateAttributes(formData) {
		this.attributes.values = {
			content: formData.content
		};
	}
}

Post.registerType('text', TextPost);
module.exports = TextPost;
