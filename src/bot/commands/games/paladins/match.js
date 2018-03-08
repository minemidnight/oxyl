const { match: createMatchImage } = require("../../../modules/images");
const { request } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [matchID], t }) {
		let matchDetails;
		try {
			matchDetails = await request().setEndpoint("getmatchdetails").data(matchID);
		} catch(err) {
			matchDetails = [];
		}

		if(!matchDetails.length) return t("commands.paladins.match.invalidID");
		const { buffer } = await createMatchImage({ matchDetails });

		return ["", {
			file: buffer,
			name: `${matchID}.png`
		}];
	},
	aliases: ["matchdetails", "matchstats"],
	args: [{
		type: "int",
		label: "matchID"
	}]
};
