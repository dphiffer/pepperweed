'use strict';

import { parse } from 'marked';
import Post from '../post.js';

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
			attributes.values.parsedContent = parse(attributes.values.content);
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
export default TextPost;
