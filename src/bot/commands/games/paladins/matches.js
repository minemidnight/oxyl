const { matches: createMatchesImage } = require("../../../modules/images");
const { request } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [player, page = 1], t }) {
		const matchHistory = await request().setEndpoint("getmatchhistory").data(player);
		if(!matchHistory[0].playerName) {
			return t("commands.paladins.matches.invalidPlayer");
		} else if(matchHistory[0].ret_msg && matchHistory[0].ret_msg.startsWith("No Match History")) {
			return t("commands.paladins.matches.noMatchHistory");
		} else if(matchHistory.length < page * 5) {
			return t("commands.paladins.matches.notEnoughMatches");
		}

		const { buffer } = await createMatchesImage({
			pageData: { page, totalPages: Math.ceil(matchHistory.length / 5) },
			matchHistory: matchHistory.slice((page - 1) * 5, page * 5)
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
	}]
};
