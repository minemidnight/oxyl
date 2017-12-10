const { player: createPlayerImage } = require("../../../modules/images");
const { request } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [player], t }) {
		[player] = await request().setEndpoint("getplayer").data(player);
		if(!player) return t("commands.paladins.player.invalidPlayer");

		const championRanks = await request().setEndpoint("getchampionranks").data(player.Name);
		const { buffer } = await createPlayerImage({ player, championRanks });

		return ["", {
			file: buffer,
			name: `${player.Name}.png`
		}];
	},
	args: [{
		type: "text",
		label: "player"
	}]
};
