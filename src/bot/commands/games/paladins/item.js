const { item: createItemImage } = require("../../../modules/images");
const fs = require("fs");
const path = require("path");
const { request } = require("../../../modules/PaladinsAPI");

let items;
async function updateChampions() {
	items = await request().setEndpoint("getitems").data(1);
	items.filter(item => item.item_type === "Card Vendor Legendary Default").forEach(item => {
		item.itemIcon_URL = item.itemIcon_URL.replace("-i", ""); // eslint-disable-line camelcase
	});
}

setTimeout(updateChampions, 2000);

module.exports = {
	async run({ args: [search], t, wiggle }) {
		const item = items.find(({ DeviceName }) => DeviceName.toLowerCase().startsWith(search));
		if(!item) return t("commands.paladins.items.invalidItem");

		let buffer;
		const fileName = `item-${item.DeviceName.toLowerCase().replace(" ", "-")}.png`;
		const savedPath = path.resolve("src", "bot", "modules", "images", "saved", fileName);
		if(fs.existsSync(savedPath)) {
			buffer = await new Promise((resolve, reject) => fs.readFile(savedPath, (err, data) => {
				if(err) reject(err);
				else resolve(data);
			}));
		} else {
			({ buffer } = await createItemImage({ item }));

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
		type: "text",
		label: "item"
	}]
};
