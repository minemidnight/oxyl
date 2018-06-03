const path = require("path");
const superagent = require("superagent");

let comicCount;
async function updateCount() {
	({ body: { num: comicCount } } = await superagent.get("https://xkcd.com/info.0.json"));
}

updateCount();

module.exports = {
	async run({ flags: { comic }, t }) {
		const { body: { img, title } } = await superagent.get(`http://xkcd.com/${comic}/info.0.json`);
		const { body: buffer } = await superagent.get(img);

		return [`<http://xkcd.com/${comic}>\n**${title}** (#${comic})`, {
			file: buffer,
			name: path.basename(img)
		}];
	},
	flags: [{
		name: "comic",
		short: "c",
		type: "int",
		min: 1,
		get default() { return Math.floor(Math.random() * comicCount) + 1; },
		get max() { return comicCount; }
	}]
};

