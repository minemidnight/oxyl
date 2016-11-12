const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");

Oxyl.registerCommand("serverinfo", "default", (message, bot) => {
	if(!message.guild) {
		return "this only works in guilds";
	} else {
		var guild = message.guild;
		var afkChannel = guild.afkChannelID;
		var members = guild.members;
		var onlineMembers = members.filter(gM => gM.presence.status === "online").size;
		var offlineMembers = members.filter(gM => gM.presence.status === "offline").size;
		var dndMembers = members.filter(gM => gM.presence.status === "dnd").size;
		var idleMembers = members.filter(gM => gM.presence.status === "idle").size;
		if(!afkChannel) {
			afkChannel = "N/A";
		} else {
			afkChannel = `${guild.channels.get(afkChannel)} (ID: ${guild.afkChannelID})`;
		}


		return `info on **${guild.name}** (ID: ${guild.id})` +
           `\n\n**Channels:**` +
           `\n **╠** Text: ${guild.channels.filter(ch => ch.type === "text").size}` +
           `\n **║ ╚** Default Channel: ${guild.defaultChannel} (ID: ${guild.defaultChannel.id})` +
           `\n **╚** Voice: ${guild.channels.filter(ch => ch.type === "voice").size}` +
           `\n     **╠** AFK Channel: ${afkChannel}` +
           `\n     **╚** AFK Timeout: ${guild.afkTimeout}` +
           `\n\n**Members:**` +
           `\n **╠** Online: ${guild.memberCount - offlineMembers}` +
           `\n **║ ╠** DND: ${dndMembers}` +
           `\n **║ ╠** Idle: ${idleMembers}` +
           `\n **║ ╚** Online: ${onlineMembers}` +
           `\n **╠** Offline: ${offlineMembers}` +
           `\n **╚** Total: ${guild.memberCount}` +
           `\n\n**Emojis:**` +
           `\n **╠** Amount: ${guild.emojis.size}` +
           `\n **╚** Emojis: ${guild.emojis.array().join("")}` +
           `\n\n**Other:**` +
           `\n **╠** Created: ${framework.formatDate(guild.createdAt)}` +
           `\n **╠** Owner: ${guild.owner.user.username}#${guild.owner.user.discriminator} (ID: ${guild.ownerID})` +
           `\n **╠** Roles: ${guild.roles.size}` +
           `\n **╠** Region: ${guild.region}` +
           `\n **╠** Verification Level: ${guild.verificationLevel}` +
           `\n **╚** Icon: ${guild.iconURL}`;
	}
}, ["guildinfo"], "Get detailed description about the guild you messaged in", "[]");
