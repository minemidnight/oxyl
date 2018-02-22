const { loadout: createLoadoutImage } = require("../../../modules/images");
const { request } = require("../../../modules/PaladinsAPI");

let champions, items;
async function updateData() {
	champions = await request().setEndpoint("getchampions").data(1);
	items = await request().setEndpoint("getitems").data(1);
}

setTimeout(updateData, 3000);

module.exports = {
	async run({ args: [player, champion, loadout], t }) {
		let loadouts = await request().setEndpoint("getplayerloadouts").data(player, 1);
		if(!loadouts[0].playerName) return t("commands.paladins.invalidPlayer");
		else if(!loadouts[0].DeckId) return t("commands.paladins.loadout.noLoadouts");

		if(!champion) {
			return t("commands.paladins.loadout.listChampions", {
				validChampions: loadouts
					.map(({ ChampionName }) => ChampionName)
					.filter((ele, i, array) => array.indexOf(ele) === i)
					.join(", ")
			});
		} else {
			champion = champions.find(({ Name }) => Name.toLowerCase().startsWith(champion));
			if(!champion) return t("commands.paladins.invalidChampion");

			loadouts = loadouts.filter(({ ChampionId }) => ChampionId === champion.id);
			if(!loadouts.length) return t("commands.paladins.loadout.noLoadoutsChampion");
		}

		if(!loadout) {
			return t("commands.paladins.loadout.listLoadouts", {
				validLoadouts: loadouts
					.map((deck, i) => `**${i + 1})** ${deck.DeckName} (id: ${deck.DeckId})`)
					.join("\n")
			});
		} else {
			loadout = loadouts.find((deck, i) => deck.DeckName.toLowerCase().startsWith(loadout) ||
				~[deck.DeckId.toString(), (i + 1).toString()].indexOf(loadout));

			const { buffer } = await createLoadoutImage({
				loadout,
				items: loadout.LoadoutItems.map(({ ItemId }) => items.find(item => item.ItemId === ItemId))
			});

			return ["", {
				file: buffer,
				name: `loadout-${loadout.DeckId}.png`
			}];
		}
	},
	args: [{
		type: "text",
		label: "player"
	}, {
		type: "text",
		label: "champion",
		optional: true
	}, {
		type: "text",
		label: "loadout",
		optional: true
	}]
};
