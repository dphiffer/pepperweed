'use strict';

class Queries {

	static InvalidInputError = class extends Error {};
	static NotFoundError = class extends Error {};

	constructor(connect) {
		this.connect = connect;
	}
}

module.exports = Queries;
