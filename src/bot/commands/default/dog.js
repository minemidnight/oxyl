const superagent = require("superagent");
module.exports = {
	process: async message => {
		let file = await superagent.get("http://shibe.online/api/shibes?count=1");
		let buffer = await superagent.get(file[0]);
		return ["", {
			file: buffer.body,
			name: file.body[0].substring(file.body[0].lastIndexOf("/") + 1)
		}];
	},
	description: "Grab a dog image from shibe.online"
};
