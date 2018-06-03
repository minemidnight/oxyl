const { player: createPlayerImage } = require("../../../modules/images");
const { request } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [player], t }) {
		[player] = await request().setEndpoint("getplayer").data(player);
		if(!player) return t("commands.paladins.invalidPlayer");


		const championRanks = await request().setEndpoint("getchampionranks").data(player.Name);
		const [{ status }] = await request().setEndpoint("getplayerstatus").data(player.Name);
		const { buffer } = await createPlayerImage({
			player,
			mostUsed: championRanks
				.slice(0, 4)
				.map(({ champion }) => `https://web2.hirez.com/paladins/champion-icons/` +
					`${champion.toLowerCase().replace("'", "").replace(" ", "-")}.jpg`),
			status
		});

		return {
			file: buffer,
			name: `${player.Name}.png`
		};
	},
	args: [{
		type: "text",
		label: "player"
	}]
};
