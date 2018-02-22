const { merge } = require("../../modules/images");

module.exports = {
	async run({ args: images, flags: { overlap } }) {
		const { buffer } = await merge({ images, overlap });

		return ["", {
			file: buffer,
			name: "merged.png"
		}];
	},
	args: [{ type: "image" }, { type: "image" }],
	caseSensitive: true,
	flags: [{
		name: "overlap",
		short: "o",
		type: "boolean",
		default: false
	}]
};
