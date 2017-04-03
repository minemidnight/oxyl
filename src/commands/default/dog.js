const request = require("request-promise");
module.exports = {
	process: async message => {
		let body = await request("http://shibe.online/api/shibes?count=1");
		body = JSON.parse(body);
		let buffer = await request({ url: body[0], encoding: null });
		return ["", {
			file: buffer,
			name: body[0].substring(body[0].lastIndexOf("/") + 1)
		}];
	},
	description: "Grab a dog image from shibe.online"
};
