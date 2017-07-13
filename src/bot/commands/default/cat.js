const superagent = require("superagent");
module.exports = {
	process: async message => {
		let { body: { file } } = await superagent.get("http://random.cat/meow");
		let { body: buffer } = await superagent.get(file);
		return ["", {
			file: buffer,
			name: file.substring(file.lastIndexOf("/") + 1)
		}];
	},
	description: "Grab a cat picture from random.cat"
};
