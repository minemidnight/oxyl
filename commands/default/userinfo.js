const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");

Oxyl.registerCommand("userinfo", "default", (message, bot) => {
	var mention = message.mentions.users.first();
	const guild = message.guild;

	if(!mention) {
		return "please mention the user you would like banned.";
	} else {
		let id = mention.id;
		let avatarUrl = mention.avatarURL;
		avatarUrl = avatarUrl.replace("avatars/", "");
		avatarUrl = avatarUrl.replace("api/v6/users", "avatars");
		avatarUrl = avatarUrl.replace("https://discordapp.com", "cdn.discordapp.com");
		let joinDate = framework.formatDate(mention.createdAt);
		let username = mention.username;
		let discriminator = mention.discriminator;
		let game = mention.presence.game;
		let status = mention.presence.status.toUpperCase();
		if(!game) {	game = "N/A"; }

		return `info on ${username}` +
           `\n **╠** ID: ${id}` +
           `\n **╠** Discriminator: #${discriminator}` +
           `\n **╠** Game: ${game}` +
           `\n **╠** Status: ${status}` +
           `\n **╠** Avatar: \`${avatarUrl}\`` +
           `\n **╚** Join Date: ${joinDate}`;
	}
}, [], "View tons of detailed information about a user", "");
