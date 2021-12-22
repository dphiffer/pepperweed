'use strict';

class Queries {

	static NotFoundError = class extends Error {};

	constructor(connect) {
		this.connect = connect;
	}
}

module.exports = Queries;
