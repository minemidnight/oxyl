const { killed } = require("../../modules/images");

module.exports = {
	async run({ args: [text], flags: { user } }) {
		const { buffer } = await killed({ text, avatar: user ? user.staticAvatarURL : undefined });

		return ["", {
			file: buffer,
			name: "killed.png"
		}];
	},
	caseSensitive: true,
	args: [{ type: "text" }],
	flags: [{
		name: "user",
		short: "u",
		type: "user"
	}]
};
