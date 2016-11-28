const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("userinfo", (message, bot) => {
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
		if(game === null) {
			game = "N/A";
		} else {
			game = game.name;
		}

		let userInfo = [
			`ID: ${id}`,
			`Discriminator: #${discriminator}`,
			`Game: ${game}`,
			`Status: ${status}`,
			`Avatar: \`${avatarUrl}\``,
			`Join Date: ${joinDate}`
		];

		userInfo = framework.listConstructor(userInfo);
		return `info on ${username}: ${userInfo}`;
	}
}, {
	type: "default",
	description: "View tons of detailed information about a user",
	args: [{ type: "mention" }]
});
