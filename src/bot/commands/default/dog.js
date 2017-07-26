const superagent = require("superagent");
module.exports = {
	process: async message => {
		let { body: [file] } = await superagent.get("http://shibe.online/api/shibes?count=1");
		let { body: buffer } = await superagent.get(file);
		return ["", {
			file: buffer,
			name: file.substring(file.lastIndexOf("/") + 1)
		}];
	},
	description: "Grab a dog image from shibe.online"
};
