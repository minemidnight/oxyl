const superagent = require("superagent");
module.exports = {
	process: async message => {
		let file = await superagent.get("http://random.cat/meow");
		let buffer = await superagent.get(file.body.file);
		return ["", {
			file: buffer.body,
			name: file.body.file.substring(file.body.file.lastIndexOf("/") + 1)
		}];
	},
	description: "Grab a cat picture from random.cat"
};
