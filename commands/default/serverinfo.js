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
		var textChannels = guild.channels.filter(ch => ch.type === "text").size;
		var voiceChannels = guild.channels.filter(ch => ch.type === "voice").size;
		if(!afkChannel) {
			afkChannel = "N/A";
		} else {
			afkChannel = `${guild.channels.get(afkChannel)} (ID: ${guild.afkChannelID})`;
		}

		var channelInfo = [
			`Text: ${textChannels}`, [
				`Default Channel: ${guild.defaultChannel} (ID: ${guild.defaultChannel.id})`
			],
			`Voice: ${voiceChannels}`, [
				`AFK Channel: ${afkChannel}`, `AFK Timeout: ${guild.afkTimeout}`
			]
		];

		var memberInfo = [
			`Online: ${guild.memberCount - offlineMembers}`,
			[
				`DND: ${dndMembers}`,
				`Idle: ${idleMembers}`,
				`Online: ${onlineMembers}`
			],
			`Offline: ${offlineMembers}`,
			`Total: ${guild.memberCount}`
		];

		var emojiInfo = [
			`Amount: ${guild.emojis.size}`,
			`Emojis: ${guild.emojis.array().join("")}`
		];

		var otherInfo = [
			`Created: ${framework.formatDate(guild.createdAt)}`,
			`Owner: ${guild.owner.user.username}#${guild.owner.user.discriminator} (ID: ${guild.ownerID})`,
			`Roles: ${guild.roles.size}`,
			`Region: ${guild.region}`,
			`Verification Level: ${guild.verificationLevel}`,
			`Icon: ${guild.iconUrl}`
		];

		channelInfo = framework.listConstructor(channelInfo);
		memberInfo = framework.listConstructor(memberInfo);
		emojiInfo = framework.listConstructor(emojiInfo);
		otherInfo = framework.listConstructor(otherInfo);

		return `info on **${guild.name}** (ID: ${guild.id})` +
           `\n\n**Channels:** ${channelInfo}` +
           `\n\n**Members:** ${memberInfo}` +
           `\n\n**Emojis:** ${emojiInfo}` +
           `\n\n**Other:** ${otherInfo}`;
	}
}, ["guildinfo"], "Get detailed description about the guild you messaged in", "[]");
