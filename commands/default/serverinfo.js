exports.cmd = new Oxyl.Command("serverinfo", async message => {
	let guild = bot.guilds.get(message.content) || message.channel.guild;

	let textChannels = guild.channels.filter(ch => ch.type === 0).length;
	let voiceChannels = guild.channels.filter(ch => ch.type === 2).length;
	let botCount = guild.members.filter(gM => gM.bot).length;
	let botPercent = ((botCount / guild.memberCount) * 100).toFixed(2);
	let userCount = guild.memberCount - botCount;
	let userPercent = ((userCount / guild.memberCount) * 100).toFixed(2);

	let channelInfo = [
		`Text: ${textChannels}`, [
			`Default Channel: ${guild.defaultChannel.mention} (ID: ${guild.defaultChannel.id})`
		],
		`Voice: ${voiceChannels}`
	];

	let memberInfo = [
		`Users: ${userCount} (${userPercent}%)`,
		`Bots: ${botCount} (${botPercent}%)`,
		`Total: ${guild.memberCount}`
	];

	let owner = guild.members.get(guild.ownerID).user;
	let otherInfo = [
		`Created: ${framework.formatDate(guild.createdAt)}`,
		`Owner: ${framework.unmention(owner)} (ID: ${owner.id})`,
		`Roles: ${guild.roles.size}`,
		`Region: ${guild.region}`,
		`Verification Level: ${guild.verificationLevel}`,
		`Icon: ${guild.iconURL ? `<${guild.iconURL}>` : "None"}`,
		`Dashboard: http://minemidnight.work/guild/${guild.id}`
	];

	channelInfo = framework.listConstructor(channelInfo);
	memberInfo = framework.listConstructor(memberInfo);
	otherInfo = framework.listConstructor(otherInfo);

	return `Info on **${guild.name}** (ID: ${guild.id})` +
           `\n\n**Channels:** ${channelInfo}` +
           `\n\n**Members:** ${memberInfo}` +
           `\n\n**Other:** ${otherInfo}`;
}, {
	guildOnly: true,
	type: "default",
	aliases: ["guildinfo"],
	description: "Get detailed description about the guild in which the message was recieved"
});
