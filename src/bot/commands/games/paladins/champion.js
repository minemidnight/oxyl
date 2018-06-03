const { champion: createChampionImage } = require("../../../modules/images");
const fs = require("fs");
const path = require("path");
const { champions, items } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [search], t }) {
		const champion = champions().find(champ => champ.Name.toLowerCase().startsWith(search));
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
			const legendaries = items()
				.filter(item => item.item_type.endsWith("Card Vendor Legendary Rank 1") && item.champion_id === champion.id)
				.sort((a, b) => a.talent_reward_level - b.talent_reward_level);
			({ buffer } = await createChampionImage({ champion, legendaries }));

			await new Promise((resolve, reject) => fs.writeFile(savedPath, buffer, (err) => {
				if(err) reject(err);
				else resolve();
			}));
		}

		return {
			file: buffer,
			name: fileName
		};
	},
	args: [{
		type: "text",
		label: "champion"
	}]
};
