const config = require("../../../config");

const OAuth2 = require("../../oauth2/index");
const patreonAuth = new OAuth2({
	api: "https://www.patreon.com/api/oauth2/api/",
	oauth2: "https://www.patreon.com/api/oauth2/"
}, {
	clientID: config.patreon.clientID,
	secret: config.patreon.secret,
	redirectURI: config.dashboardURL
}, { expireTime: 600000 });

module.exports = {
	updateAll: async r => {
		process.logger.debug("patreon", "Checking status of all patreons");

		const premiums = await r.table("discordPatreonLink")
			.filter(r.row("premiumServers").ne(0))
			.map(doc => doc.merge({
				serverIDs: r.table("premiumServers")
					.getAll(doc("id"), { index: "donatorID" })("donatorID")
					.coerceTo("array")
			}))
			.run();

		for(const premiumData of premiums) {
			await module.exports.updatePledge(premiumData, r);

			const max = Math.floor(premiumData.pledge / 100);
			if(premiumData.premiumServers > max) {
				process.logger.info("patreon", `Removing premium from ${max - premiumData.premiumServers} server(s)`);
				for(const serverID of premiumData.serverIDs.slice(max - premiumData.premiumServers)) {
					await r.table("premiumServers")
						.get(serverID)
						.delete();
				}

				premiumData.premiumServers = max;
			}

			await r.table("discordPatreonLink")
				.get(premiumData.id)
				.update({
					pledge: premiumData.pledge,
					token: premiumData.token,
					premiumServers: premiumData.premiumServers
				});
		}
	},
	updatePledge: async (doc, r) => {
		let patreonInfo = await patreonAuth.info(doc.token, "current_user");
		if(patreonInfo.token) {
			doc.token = patreonInfo.token;
			patreonInfo = patreonInfo.info;
		}

		const oxylPledge = patreonInfo.data.relationships.pledges.data
			.find(pledge => pledge.relations.creator.id === "5374558" && !pledge.attributes.is_paused);

		Object.assign(doc, {
			pledge: oxylPledge ? oxylPledge.amount_cents : 0,
			token: doc.token
		});
	}
};
