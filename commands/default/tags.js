const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	tags = require("../tags.js").tags;

var command = new Command("tag", (message, bot) => {
	let globalTags = tags.user[message.author.id],
		guildTags = tags.user[message.author.id],
		channelTags = tags.user[message.author.id],
		userTags = tags.user[message.author.id];
}, {
	type: "default",
	aliases: ["taglist"],
	description: "List tags"
});
