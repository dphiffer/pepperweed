'use strict';

class Base {

	id = null;
	data = {};

	constructor(init) {
		this.id = init.id;
		delete init.id;
		this.data = init;
	}
}

export default Base;
