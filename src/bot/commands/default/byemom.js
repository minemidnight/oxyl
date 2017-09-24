const images = require("../../modules/images/main");
module.exports = {
	process: async message => {
		let { buffer, ext } = await images.byeMom(message.args[0]);
		return ["", {
			file: buffer,
			name: `byemom.${ext}`
		}];
	},
	description: "Create a \"ok bye mom\" meme",
	args: [{ type: "text" }]
};
