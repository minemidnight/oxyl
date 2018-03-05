const { resize } = require("../../modules/images");

module.exports = {
	async run({ args: [image, width, height] }) {
		const { buffer } = await resize({ image, width, height });

		return ["", {
			file: buffer,
			name: "resized.png"
		}];
	},
	args: [{ type: "image" }, {
		type: "int",
		label: "width",
		min: 1,
		max: 1500
	}, {
		type: "int",
		label: "height",
		min: 1,
		max: 1500
	}],
	caseSensitive: true
};
