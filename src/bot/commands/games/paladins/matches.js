const { matches: createMatchesImage } = require("../../../modules/images");
const { request } = require("../../../modules/PaladinsAPI");

let champions;
async function updateChampions() {
	champions = await request().setEndpoint("getchampions").data(1);
}

setTimeout(updateChampions, 2000);

module.exports = {
	async run({ args: [player, page = 1], flags: { champion }, t }) {
		let matchHistory = await request().setEndpoint("getmatchhistory").data(player);
		if(!matchHistory[0].playerName) {
			return t("commands.paladins.matches.invalidPlayer");
		} else if(matchHistory[0].ret_msg && matchHistory[0].ret_msg.startsWith("No Match History")) {
			return t("commands.paladins.matches.noMatchHistory");
		}

		if(champion) {
			champion = champions.find(champ => champ.Name.toLowerCase().startsWith(champion));
			if(champion) matchHistory = matchHistory.filter(match => match.ChampionId === champion.id);
		}
		if(!matchHistory.length) return t("commands.paladins.matches.noMatchHistory");
		else if(matchHistory.length < (page - 1) * 5) return t("commands.paladins.matches.notEnoughMatches");


		const matches = matchHistory.slice((page - 1) * 5, page * 5);
		const { buffer } = await createMatchesImage({
			pageData: { page, totalPages: Math.ceil(matchHistory.length / 5) },
			matchHistory: matches
		});


		return ["", {
			file: buffer,
			name: `${player.Name}-matches.png`
		}];
	},
	args: [{
		type: "text",
		label: "player"
	}, {
		type: "int",
		label: "page",
		optional: true,
		min: 1,
		max: 10
	}],
	flags: [{
		name: "champion",
		short: "c",
		aliases: ["champ"],
		type: "text"
	}]
};
