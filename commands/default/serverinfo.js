const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("serverinfo", (message, bot) => {
	let guild;
	if(message.content && bot.guilds.get(message.content)) {
		guild = bot.guilds.get(message.content);
			// hidden feature
	} else {
		guild = message.guild;
	}

	let afkChannel = guild.afkChannelID;
	let members = guild.members;
	let onlineMembers = members.filter(gM => gM.status === "online").length;
	let offlineMembers = members.filter(gM => gM.status === "offline").length;
	let dndMembers = members.filter(gM => gM.status === "dnd").length;
	let idleMembers = members.filter(gM => gM.status === "idle").length;
	let bots = members.filter(gM => gM.user.bot).length;
	let textChannels = guild.channels.filter(ch => ch.type === 0).length;
	let voiceChannels = guild.channels.filter(ch => ch.type === 2).length;
	if(!afkChannel) {
		afkChannel = "N/A";
	} else {
		afkChannel = `${guild.channels.get(afkChannel)} (ID: ${guild.afkChannelID})`;
	}

	var channelInfo = [
		`Text: ${textChannels}`, [
			`Default Channel: ${guild.defaultChannel.name} (ID: ${guild.defaultChannel.id})`
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
		`Amount: ${guild.emojis.length}`,
		`Emojis: ${guild.emojis.map(emoji => `<:${emoji.name}:${emoji.id}>`) || "None"}`
	];

	let owner = guild.members.get(guild.ownerID).user;
	var otherInfo = [
		`Created: ${framework.formatDate(guild.createdAt)}`,
		`Owner: ${framework.unmention(owner)} (ID: ${owner.id})`,
		`Roles: ${guild.roles.size}`,
		`Region: ${guild.region}`,
		`Verification Level: ${guild.verificationLevel}`,
		`Icon: ${guild.iconURL || "None"}`
	];

	channelInfo = framework.listConstructor(channelInfo);
	memberInfo = framework.listConstructor(memberInfo);
	emojiInfo = framework.listConstructor(emojiInfo);
	otherInfo = framework.listConstructor(otherInfo);

	return `Info on **${guild.name}** (ID: ${guild.id})` +
           `\n\n**Channels:** ${channelInfo}` +
           `\n\n**Members:** ${memberInfo}` +
           `\n\n**Emojis:** ${emojiInfo}` +
           `\n\n**Other:** ${otherInfo}`;
}, {
	guildOnly: true,
	type: "default",
	aliases: ["guildinfo"],
	description: "Get detailed description about the guild in which the message was recieved"
});
