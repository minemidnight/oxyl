const { matches: createMatchesImage } = require("../../../modules/images");
const { champions, request } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [player, page = 1], flags: { champion, competitive }, t }) {
		let matchHistory = await request().setEndpoint("getmatchhistory").data(player);
		if(!matchHistory[0].playerName) {
			return t("commands.paladins.invalidPlayer");
		} else if(matchHistory[0].ret_msg && matchHistory[0].ret_msg.startsWith("No Match History")) {
			return t("commands.paladins.matches.noMatchHistory");
		}

		if(competitive) matchHistory = matchHistory.filter(match => ~["Competitive", "Ranked"].indexOf(match.Queue));
		if(champion) {
			champion = champions().find(champ => champ.Name.toLowerCase().startsWith(champion));
			if(champion) matchHistory = matchHistory.filter(match => match.ChampionId === champion.id);
		}


		if(!matchHistory.length) return t("commands.paladins.matches.noMatchHistory");
		else if(matchHistory.length < (page - 1) * 5) return t("commands.paladins.matches.notEnoughMatches");

		const matches = matchHistory.slice((page - 1) * 5, page * 5);
		const { buffer } = await createMatchesImage({
			page,
			totalPages: Math.ceil(matchHistory.length / 5),
			matchHistory: matches
		});

		return ["", {
			file: buffer,
			name: `${player}-matches.png`
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
	}, {
		name: "competitive",
		short: "r",
		aliases: ["ranked", "comp"],
		type: "boolean",
		default: false
	}]
};
