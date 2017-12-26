const path = require("path");
const superagent = require("superagent");

module.exports = {
	async run({ channel, flags, guild, reply, t }) {
		const { body: [file] } = await superagent.get("http://shibe.online/api/birds?count=1");
		const { body: buffer } = await superagent.get(file);

		return ["", {
			file: buffer,
			name: path.basename(file)
		}];
	}
};
