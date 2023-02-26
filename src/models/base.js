'use strict';

class Base {

	data = {};

	get id() {
		return this.data.id;
	}

	constructor(init) {
		this.data = init;
	}
}

module.exports = Base;
