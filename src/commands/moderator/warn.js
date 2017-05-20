const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return __("phrases.notInGuild", message);

		let warnable = bot.utils.isPunishable(member, message.author.id);
		if(!warnable) {
			return __("commands.moderator.warn.noPerms", message);
		} else {
			let warnCount = (await r.table("warnings").filter({
				guildID: message.channel.guild.id,
				userID: member.id
			}).run()).length + 1;

			let kick, ban;
			let kickAt = (await r.table("settings").filter({
				guildID: message.channel.guild.id,
				name: "modLog.kickat"
			}).run())[0];
			let banAt = (await r.table("settings").filter({
				guildID: message.channel.guild.id,
				name: "modLog.banat"
			}).run())[0];
			if(kickAt && warnCount === kickAt.value) kick = true;
			if(banAt && warnCount >= banAt.value) ban = true;

			let channel = await modLog.channel(message.channel.guild.id);
			if(channel) {
				if(message.args[1]) {
					modLog.presetReasons[message.channel.guild.id] = { reason: message.args[1], mod: message.author };
				}
				await modLog.create(message.channel.guild, "warn", member.user, { warnCount });

				if(ban || kick) {
					modLog.presetReasons[message.channel.guild.id] = { reason: "Warning Threshold", mod: message.author };
					if(ban) {
						member.ban(7);
					} else if(kick) {
						member.kick();
						modLog.create(message.channel.guild, "kick", message.args[0]);
					}
				}
			}

			await r.table("warnings").insert({ guildID: message.channel.guild.id, userID: member.id }).run();
			return __("commands.moderator.warn.success", message, { user: member.user.username, warnCount });
		}
	},
	caseSensitive: true,
	guildOnly: true,
	perm: "banMembers",
	description: "Give a member a warning",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
