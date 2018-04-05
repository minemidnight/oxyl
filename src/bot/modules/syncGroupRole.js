const superagent = require("superagent");

module.exports = async (member, userID, groupID) => {
	if(!groupID) return;
	const { text: role } = await superagent.get(`https://www.roblox.com/Game/LuaWebService/` +
	`HandleSocialRequest.ashx?method=GetGroupRole`)
		.query({
			playerid: userID,
			groupid: groupID
		});

	if(role === "Guest") return;
	const roleToGive = member.guild.roles.find(({ name }) => name.toLowerCase() === role.toLowerCase());
	if(roleToGive) {
		member.addRole(roleToGive.id, "Group Role Sync")
			.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
	}
};

module.exports.updateGroupRoles = async ({ erisClient: client, locals: { r } }) => {
	const groupSyncs = await r.table("robloxVerification")
		.hasFields("groupID")
		.filter(r.row("enabled").eq(true))
		.map(doc => doc.pluck("id", "groupID")
			.merge({
				verifiedUsers: r.table("robloxVerified")
					.getAll(doc("id"), { index: "guildID" })
					.map(doc2 => ({
						discordID: doc2("id")(1),
						robloxID: doc2("userID")
					})).coerceTo("array")
			})
		)
		.run();

	for(const guildData of groupSyncs) {
		const guild = client.guilds.get(guildData.id);

		for(const verifiedUser of guildData.verifiedUsers) {
			const member = guild.members.get(verifiedUser.discordID);

			if(!member) continue;
			else module.exports(member, verifiedUser.robloxID, guildData.groupID);

			await new Promise(resolve => setTimeout(resolve, 500));
		}
	}
};
