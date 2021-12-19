'use strict';

let fs = require('fs');
let path = require('path');
let sodium = require('sodium-native');

let root = path.dirname(__dirname);
let example_path = path.join(root, 'conf', 'secrets.js.example');
let secrets_path = path.join(root, 'conf', 'secrets.js');

if (fs.existsSync(secrets_path)) {
	console.log('conf/secrets.js already exists');
	return;
}

console.log('Setting up conf/secrets.js...');

let buffer = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
sodium.randombytes_buf(buffer);
let key = buffer.toString('hex');

let secrets_config = `module.exports = {
	session_key: '${key}'
};`;

fs.writeFileSync(secrets_path, secrets_config, 'utf8');

console.log('Done');
