const request = require("request-promise");
module.exports = {
	process: async message => {
		let body = await request("http://random.cat/meow");
		body = JSON.parse(body);
		let buffer = await request({ url: body.file, encoding: null });
		return ["", {
			file: buffer,
			name: body.file.substring(body.file.lastIndexOf("/") + 1)
		}];
	},
	description: "Grab a cat picture from random.cat"
};
