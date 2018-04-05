const { championstats: createStatsImage } = require("../../../modules/images");
const { request } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [player, champion], t }) {
		const ranks = await request().setEndpoint("getchampionranks").data(player);
		if(!ranks.length) return t("commands.paladins.invalidPlayer");

		const championStats = ranks.find(({ champion: name }) => name.toLowerCase().startsWith(champion));
		if(!championStats) return t("commands.paladins.invalidChampion");

		const rankedStats = await request().setEndpoint("getqueuestats").data(player, 428);
		const rankedChampionStats = rankedStats.find(stats => stats.Champion.toLowerCase().startsWith(champion));

		["Wins", "Losses", "Matches", "Minutes", "Kills", "Deaths", "Assists"]
			.forEach(field => championStats[field] = rankedChampionStats[field]);

		const { buffer } = await createStatsImage(championStats);

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
