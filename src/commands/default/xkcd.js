const request = require("request-promise");
let maxComic = 0;
module.exports = {
	process: async message => {
		if(message.args[0] && message.args[0] > maxComic) {
			return __("commands.default.xkcd.invalidComic", message, { comicRange: `1-${maxComic}` });
		}

		let comic = message.args[0] || Math.floor(Math.random() * maxComic) + 1;
		let body = await request(`http://xkcd.com/${comic}/info.0.json`);
		body = JSON.parse(body);

		let buffer = await request(body.img, { encoding: null });
		return [`<http://xkcd.com/${comic}>\n**${body.title}** (#${comic})`, {
			file: buffer,
			name: body.img.substring(body.img.lastIndexOf("/") + 1)
		}];
	},
	updateComic: async () => maxComic = JSON.parse(await request("https://xkcd.com/info.0.json")).num,
	description: "Grab a xkcd from xkcd.com",
	args: [{
		label: "comic number",
		type: "num",
		min: 1,
		optional: true
	}]
};

module.exports.updateComic();
setInterval(module.exports.updateComic, 10800000);
