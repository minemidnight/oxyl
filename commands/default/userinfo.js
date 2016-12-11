const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	googl = require("goo.gl");
const config = framework.config;
googl.setKey(config.private.googleKey);

var command = new Command("userinfo", (message, bot) => {
	let user = message.author;
	if(message.args[0]) user = message.args[0];

	var info = {
		ID: user.id,
		Discriminator: user.discriminator,
		Avatar: user.avatarURL ? "Shortening Link..." : "No Avatar",
		Game: user.presence.game === null ? "Nothing" : user.presence.game.name,
		Status: user.presence.status.toUpperCase(),
		"Join Date": framework.formatDate(user.createdAt)
	};

	if(message.guild) info["Guild Join Date"] = framework.formatDate(message.guild.member(user).joinedAt);

	let constructorData = [];
	for(var i in info) {
		constructorData.push(`${i}: ${info[i]}`);
	}

	constructorData = framework.listConstructor(constructorData);
	message.channel.sendMessage(`Info on ${user.username}: ${constructorData}`)
	.then(msg => {
		if(!user.avatarURL) return;
		googl.shorten(user.avatarURL, { quotaUser: message.author.id }).then((shortUrl) => {
			msg.content = msg.content.replace("Shortening Link...", `<${shortUrl}>`);
			msg.edit(msg.content);
		});
	});
}, {
	type: "default",
	description: "View tons of detailed information about a user",
	args: [{
		type: "user",
		optional: true
	}]
});
