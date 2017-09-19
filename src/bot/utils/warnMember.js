const modLog = require("../modules/modLog.js");
module.exports = async (member, mod, reason) => {
	let { length: warnCount } = await r.table("warnings")
		.getAll(member.id, { index: "userID" })
		.filter({ guildID: member.guild.id }).run();
	warnCount++;

	let kick, ban;
	let kickAt = await r.table("settings").get(["modLog.kickat", member.guild.id]).run();
	let banAt = await r.table("settings").get(["modLog.banAt", member.guild.id]).run();
	if(banAt && warnCount >= banAt.value) ban = true;
	if(kickAt && warnCount >= kickAt.value) kick = true;

	let channel = await modLog.channel(member.guild);
	if(channel) {
		if(reason) modLog.presetReasons[member.guild.id] = { reason, mod };
		await modLog.create(member.guild, "warn", member.user, { warnCount });

		if(ban || kick) {
			modLog.presetReasons[member.guild.id] = { reason: "Warning Threshold", mod };
		}
	}

	if(ban) {
		member.ban(7, "Warning Threshold");
	} else if(kick) {
		member.kick("Warning Threshold");
		modLog.create(member.guild, "kick", member.user);
	}

	await r.table("warnings").insert({ guildID: member.guild.id, userID: member.id }).run();
	return warnCount;
};
