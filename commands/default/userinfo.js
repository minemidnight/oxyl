const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	googl = require("goo.gl");
const config = framework.config;
googl.setKey(config.private.googleKey);

var command = new Command("userinfo", (message, bot) => {
	let user = message.author;
	if(message.args[0]) user = message.args[0];
	user = message.channel.guild.members.get(user.id);

	var info = {
		ID: user.id,
		Discriminator: user.user.discriminator,
		Avatar: user.user.avatarURL ? "Shortening Link..." : "No Avatar",
		Game: user.game === null ? "Nothing" : user.game.name,
		Status: user.status.toUpperCase(),
		"Join Date": framework.formatDate(user.user.createdAt),
		"Guild Join Date": framework.formatDate(user.joinedAt)
	};

	let constructorData = [];
	for(var i in info) {
		constructorData.push(`${i}: ${info[i]}`);
	}

	constructorData = framework.listConstructor(constructorData);
	message.channel.createMessage(`Info on ${user.user.username}: ${constructorData}`)
	.then(msg => {
		if(!user.user.avatarURL) return;
		googl.shorten(user.user.avatarURL, { quotaUser: user.id }).then((shortUrl) => {
			msg.content = msg.content.replace("Shortening Link...", `<${shortUrl}>`);
			msg.edit(msg.content);
		});
	});
	return undefined;
}, {
	guildOnly: true,
	type: "default",
	description: "View tons of detailed information about a user",
	args: [{
		type: "user",
		optional: true
	}]
});
