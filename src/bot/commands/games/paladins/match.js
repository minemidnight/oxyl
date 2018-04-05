const { match: createMatchImage } = require("../../../modules/images");
const { champions, items, request } = require("../../../modules/PaladinsAPI");

module.exports = {
	async run({ args: [matchID], flags: { player }, t }) {
		let matchDetails;
		try {
			matchDetails = await request().setEndpoint("getmatchdetails").data(matchID);
		} catch(err) {
			matchDetails = [];
		}

		if(!matchDetails.length) return t("commands.paladins.match.invalidID");

		matchDetails.forEach(details => {
			details.talent = items().find(item => item.ItemId === details.ItemId6);
			details.items = [];
			details.loadout = [];
			for(let i = 1; i < 6; i++) {
				details.loadout.push(Object.assign(items().find(item => item.ItemId === details[`ItemId${i}`]),
					{ level: details[`ItemLevel${i}`] + 1 }
				));

				if(i === 4 || !details[`ActiveId${i}`]) continue;
				details.items.push(Object.assign(items().find(item => item.ItemId === details[`ActiveId${i}`]),
					{ level: details[`ActiveLevel${i}`] + 1 }
				));
			}
		});

		let bans = null;
		if(matchDetails[0].name === "Ranked") {
			bans = [];
			for(let i = 1; i <= 4; i++) {
				if(!matchDetails[0][`BanId${i}`]) continue;
				bans.push(champions().find(champ => champ.id === matchDetails[0][`BanId${i}`]).ChampionIcon_URL);
			}
		}

		const { buffer } = await createMatchImage({ bans, matchDetails, player });
		return ["", {
			file: buffer,
			name: `${matchID}.png`
		}];
	},
	aliases: ["matchdetails", "matchstats"],
	args: [{
		type: "int",
		label: "matchID"
	}],
	flags: [{
		name: "player",
		short: "p",
		type: "text"
	}]
};
