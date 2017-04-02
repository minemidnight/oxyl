const request = require("request-promise");
module.exports = {
	process: async message => {
		let maxComic = JSON.parse(await request("https://xkcd.com/info.0.json")).num;
		if(message.args[0] && message.args[0] > maxComic) return `Invalid Comic! Comics available: 1-${maxComic}`;

		let comic = message.args[0] || Math.floor(Math.random() * maxComic) + 1;
		let body = await request(`http://xkcd.com/${comic}/info.0.json`);
		body = JSON.parse(body);

		let buffer = await request(body.img, { encoding: null });
		return [`<http://xkcd.com/${comic}>\n**${body.title}** (#${comic})`, {
			file: buffer,
			name: body.img.substring(body.img.lastIndexOf("/") + 1)
		}];
	},
	description: "Grab a xkcd from xkcd.com",
	args: [{
		label: "comic number",
		type: "int",
		min: 1,
		optional: true
	}]
};
