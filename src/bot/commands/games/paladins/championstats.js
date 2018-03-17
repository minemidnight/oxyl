const { championstats: createStatsImage } = require("../../../modules/images");
const { request } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [player, champion], t }) {
		const ranks = await request().setEndpoint("getchampionranks").data(player);
		if(!ranks.length) return t("commands.paladins.invalidPlayer");

		champion = ranks.find(({ champion: name }) => name.toLowerCase().startsWith(champion));
		if(!champion) return t("commands.paladins.invalidChampion");

		const { buffer } = await createStatsImage({ championInfo: champion });

		return ["", {
			file: buffer,
			name: "champion-stats.png"
		}];
	},
	aliases: ["championinfo"],
	args: [{
		type: "text",
		label: "player"
	}, {
		type: "text",
		label: "champion",
		optional: true
	}]
};
