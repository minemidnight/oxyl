const { request } = require("../../../modules/PaladinsAPI");
const { champion: createChampionImage } = require("../../../modules/images");

const images = {};

let champions, items;
async function updateChampions() {
	champions = await request().setEndpoint("getchampions").data(1);
	items = await request().setEndpoint("getitems").data(1);

	champions.forEach(async (champion, i) => {
		const legendaries = items.filter(item => item.item_type.endsWith("Legendary") &&
			item.champion_id === champion.id);

		images[champion.Name.toLowerCase()] = await createChampionImage({ champion, legendaries });
	});
}

setTimeout(updateChampions, 2000);

module.exports = {
	async run({ args: [search], t, wiggle }) {
		const champion = champions.find(champ => champ.Name.toLowerCase().startsWith(search));
		if(!champion) return t("commands.paladins.champion.invalidChampion");

		const { buffer, ext } = images[champion.Name.toLowerCase()];
		return ["", {
			file: buffer,
			name: `${champion.Name.toLowerCase()}.${ext}`
		}];
	},
	args: [{
		type: "text",
		label: "champion"
	}]
};
