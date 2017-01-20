const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	googl = require("goo.gl");
const config = framework.config;
googl.setKey(config.private.googleKey);

var command = new Command("userinfo", async (message, bot) => {
	let user = message.author;
	if(message.args[0]) user = message.args[0];
	user = message.channel.guild.members.get(user.id);

	let constructorData = [
		`ID: ${user.id}`,
		`Discriminator: ${user.user.discriminator}`,
		`Avatar: ${user.user.avatarURL ? "Shortening Link..." : "No Avatar"}`,
		`Game: ${user.game ? user.game.name : "Nothing"}`,
		`Status: ${user.status.toUpperCase()}`,
		`Join Date: ${framework.formatDate(user.user.createdAt)}`,
		`Guild Join Date: ${framework.formatDate(user.joinedAt)}`,
		`Profile: http://minemidnight.work/user/${user.id}`
	];

	constructorData = framework.listConstructor(constructorData);
	let msg = await message.channel.createMessage(`Info on ${user.user.username}: ${constructorData}`);

	if(!user.user.avatarURL) return;
	let shortUrl = await googl.shorten(user.user.avatarURL, { quotaUser: user.id });
	msg.content = msg.content.replace("Shortening Link...", `<${shortUrl}>`);
	msg.edit(msg.content);
	return;
}, {
	guildOnly: true,
	type: "default",
	description: "View tons of detailed information about a user",
	args: [{
		type: "user",
		optional: true
	}]
});
