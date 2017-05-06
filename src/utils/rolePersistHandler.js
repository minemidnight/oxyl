const modLog = require("../modules/modLog.js");
module.exports = async (guild, member, type) => {
	let persists = await r.table("rolePersist").filter({ guildID: guild.id, rule: true }).run();
	if(persists.length === 0) return;
	else persists = persists.map(data => data.roleID);

	if(type === "leave") {
		if(member.roles && member.roles.length === 0) return;

		let toPersist = member.roles.filter(roleID => ~persists.indexOf(roleID));
		await r.table("rolePersist").insert({
			guildID: guild.id,
			roles: toPersist,
			memberID: member.id,
			rule: false
		}).run();
	} else if(type === "join") {
		let persistData = (await r.table("rolePersist").filter({
			guildID: guild.id,
			memberID: member.id,
			rule: false
		}).run())[0];

		if(!persistData || persistData.roles.length === 0) return;
		await r.table("rolePersist").get(persistData.id).delete().run();

		let channel = await modLog.channel(guild);
		let trackedRoles = (await r.table("settings").filter({
			guildID: guild.id,
			name: "modLog.track"
		}).run())[0];

		for(let roleID of persistData.roles) {
			if(trackedRoles && ~trackedRoles.value.indexOf(roleID) && channel) {
				modLog.presetReasons[guild.id] = { reason: "Role Persist", mod: bot.user };
			}
			try {
				await member.addRole(roleID);
			} catch(err) {} // eslint-disable-line no-empty
		}
	}
};
