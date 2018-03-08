const { champion: createChampionImage } = require("../../../modules/images");
const fs = require("fs");
const path = require("path");
const { request } = require("../../../modules/PaladinsAPI");

let champions, items;
async function updateChampions() {
	champions = await request().setEndpoint("getchampions").data(1);
	items = await request().setEndpoint("getitems").data(1);
}

setTimeout(updateChampions, 3000);

module.exports = {
	async run({ args: [search], t }) {
		const champion = champions.find(champ => champ.Name.toLowerCase().startsWith(search));
		if(!champion) return t("commands.paladins.invalidChampion");

		let buffer;
		const fileName = `${champion.Name.toLowerCase().replace("'", "").replace(" ", "-")}.png`;
		const savedPath = path.resolve("src", "bot", "modules", "images", "saved", fileName);
		if(fs.existsSync(savedPath)) {
			buffer = await new Promise((resolve, reject) => fs.readFile(savedPath, (err, data) => {
				if(err) reject(err);
				else resolve(data);
			}));
		} else {
			const legendaries = items.filter(item => item.item_type.endsWith("Card Vendor Legendary Rank 1") &&
				item.champion_id === champion.id);
			({ buffer } = await createChampionImage({ champion, legendaries }));

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
		label: "champion"
	}]
};
