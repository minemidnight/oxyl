const path = require("path");
const superagent = require("superagent");
const { convert: { toCodePoint } } = require("twemoji");

module.exports = {
	async run({ args: [emoji], flags: { svg }, resolver, t }) {
		let file;
		try {
			const { url } = resolver.emoji(emoji);
			file = url;
		} catch(err) {
			const codepoint = toCodePoint(emoji);
			if(svg) file = `https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/svg/${codepoint}.svg`;
			else file = `https://raw.githubusercontent.com/twitter/twemoji/gh-pages/2/72x72/${codepoint}.png`;
		}

		try {
			const { body: buffer } = await superagent.get(file);

			return ["", {
				file: buffer,
				name: path.basename(file)
			}];
		} catch(err) {
			return t("commands.hugemoji.error");
		}
	},
	aliases: ["e", "emoji"],
	args: [{
		type: "text",
		label: "emoji"
	}],
	flags: [{
		name: "svg",
		short: "s",
		type: "boolean",
		default: false
	}]
};
