const modLog = require("../../modules/modLog.js");
module.exports = async (guild, member, oldMember) => {
	if(!member || !oldMember) return;
	else if(member.roles === oldMember.roles) return;

	let addedRoles = member.roles.filter(role => !~oldMember.roles.indexOf(role));
	let removedRoles = oldMember.roles.filter(role => !~member.roles.indexOf(role));
	if(bot.config.bot.donator && ~addedRoles.indexOf(bot.config.bot.donator.role)) {
		r.table("donators").insert({ userID: member.id }).run();
		if(bot.config.bot.donator.channel && !bot.config.beta) {
			bot.createMessage(bot.config.bot.donator.channel, `Thank you <@${member.id}> for donating to Oxyl!`);
		}
	} else if(bot.config.bot.donator && ~removedRoles.indexOf(bot.config.bot.donator.role)) {
		r.table("donators").get(member.id).delete().run();
	}

	let trackedRoles = await r.table("settings").get(["modLog.track", guild.id]).run();
	if(!trackedRoles || !trackedRoles.value) return;
	else trackedRoles = trackedRoles.value;

	trackedRoles.forEach(tracked => {
		if(~addedRoles.indexOf(tracked)) {
			modLog.create(guild, "specialRoleAdd", member.user || member, { role: tracked });
		} else if(~removedRoles.indexOf(tracked)) {
			modLog.create(guild, "specialRoleRemove", member.user || member, { role: tracked });
		}
	});
};
