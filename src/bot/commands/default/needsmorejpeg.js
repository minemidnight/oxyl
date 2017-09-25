const images = require("../../modules/images/main");
module.exports = {
	process: async message => {
		let { buffer, ext } = await images.needsMoreJpeg(message.args[0]);
		return ["", {
			file: buffer,
			name: `needsmorejpeg.${ext}`
		}];
	},
	description: "Make the quality of an image worse",
	args: [{ type: "image" }]
};
