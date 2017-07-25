const modLog = require("../modules/modLog.js");
module.exports = async (guild, member, type) => {
	let persists = await r.table("rolePersistRules").getAll(guild.id, { index: "guildID" }).run();
	if(!persists.length) return;
	else persists = persists.map(data => data.roleID);

	if(type === "leave") {
		let toPersist = member.roles.filter(roleID => ~persists.indexOf(roleID));
		if(!member.roles.length || !toPersist.length) return;

		await r.table("rolePersistStorage").insert({
			id: [member.id, guild.id],
			guildID: guild.id,
			roles: toPersist,
			memberID: member.id
		}).run();
	} else if(type === "join") {
		let persistData = await r.table("rolePersistStorage").get([member.id, guild.id]).run();
		if(!persistData || !persistData.roles.length) return;

		await r.table("rolePersistStorage").get([member.id, guild.id]).delete().run();
		let channel = await modLog.channel(guild);
		let trackedRoles = await r.table("settings").get(["modLog.track", guild.id]).run();

		for(let roleID of persistData.roles) {
			if(trackedRoles && ~trackedRoles.value.indexOf(roleID) && channel) {
				modLog.presetReasons[guild.id] = { reason: __("phrases.rolePersist", guild), mod: bot.user };
			}

			member.addRole(roleID, "Role Persist").catch(() => {}); // eslint-disable-line no-empty-function
		}
	}
};
