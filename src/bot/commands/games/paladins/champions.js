const { champions: createChampionsImage } = require("../../../modules/images");
const fs = require("fs");
const path = require("path");
const { champions } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [page = 1], t, wiggle }) {
		let buffer;
		const fileName = `champions-page-${page}.png`;
		const savedPath = path.resolve("src", "bot", "modules", "images", "saved", fileName);
		if(fs.existsSync(savedPath)) {
			buffer = await new Promise((resolve, reject) => fs.readFile(savedPath, (err, data) => {
				if(err) reject(err);
				else resolve(data);
			}));
		} else {
			({ buffer } = await createChampionsImage({
				page,
				totalPages: Math.ceil(champions().length / 3),
				champions: champions().slice((page - 1) * 3, page * 3)
			}));

			await new Promise((resolve, reject) => fs.writeFile(savedPath, buffer, (err) => {
				if(err) reject(err);
				else resolve();
			}));
		}

		return ["", {
			file: buffer,
			name: fileName
		}];
	},
	args: [{
		type: "int",
		label: "page",
		optional: true,
		min: 1,
		get max() { return Math.ceil(champions().length / 3); }
	}]
};
