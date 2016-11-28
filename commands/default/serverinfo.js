const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("serverinfo", (message, bot) => {
	if(!message.guild) {
		return "this only works in guilds";
	} else {
		let guild;
		if(message.content && bot.guilds.get(message.content)) {
			guild = bot.guilds.get(message.content);
			// hidden feature
		} else {
			guild = message.guild;
		}

		let afkChannel = guild.afkChannelID;
		let members = guild.members;
		let onlineMembers = members.filter(gM => gM.presence.status === "online").size;
		let offlineMembers = members.filter(gM => gM.presence.status === "offline").size;
		let dndMembers = members.filter(gM => gM.presence.status === "dnd").size;
		let idleMembers = members.filter(gM => gM.presence.status === "idle").size;
		let bots = members.filter(gM => gM.user.bot).size;
		let textChannels = guild.channels.filter(ch => ch.type === "text").size;
		let voiceChannels = guild.channels.filter(ch => ch.type === "voice").size;
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
			`Online: ${onlineMembers + idleMembers + dndMembers}`,
			[
				`DND: ${dndMembers}`,
				`Idle: ${idleMembers}`,
				`Online: ${onlineMembers}`
			],
			`Offline: ${offlineMembers}`,
			`Bots: ${bots}`,
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
}, {
	type: "default",
	aliases: ["guildinfo"],
	description: "Get detailed description about the guild in which the message was recieved"
});
