'use strict';

class Base {

	id = null;
	data = {};

	constructor(init) {
		if (typeof init == 'number') {
			this.id = init;
		} else if (typeof init == 'object') {
			if (init.id) {
				this.id = init.id;
				delete init.id;
			}
			this.data = init;
		}
	}
}

module.exports = Base;
