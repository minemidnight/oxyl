const modLog = require("../../modules/modLog.js");
module.exports = async (guild, member, oldMember) => {
	if(!member || !oldMember) return;
	else if(member.roles === oldMember.roles) return;

	let addedRoles = member.roles.filter(role => !~oldMember.roles.indexOf(role));
	let removedRoles = oldMember.roles.filter(role => !~member.roles.indexOf(role));
	if(bot.publicConfig.donator && ~addedRoles.indexOf(bot.publicConfig.donator.role)) {
		r.table("donators").insert({ id: member.id }).run();
		if(bot.publicConfig.donator.channel) {
			bot.createMessage(bot.publicConfig.donator.channel, `Thank you <@${member.id}> for donating to Oxyl!`);
		}
	} else if(bot.publicConfig.donator && ~removedRoles.indexOf(bot.publicConfig.donator.role)) {
		r.table("donators").filter({ id: member.id }).delete().run();
	}

	let trackedRoles = (await r.table("settings").filter({
		guildID: guild.id,
		name: "modLog.track"
	}).run())[0];
	if(!trackedRoles) return;
	else trackedRoles = trackedRoles.value;

	trackedRoles.forEach(tracked => {
		if(~addedRoles.indexOf(tracked)) {
			modLog.create(guild, "specialRoleAdd", member.user || member, { role: tracked });
		} else if(~removedRoles.indexOf(tracked)) {
			modLog.create(guild, "specialRoleRemove", member.user || member, { role: tracked });
		}
	});
};
