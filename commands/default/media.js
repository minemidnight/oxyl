const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	fs = require("fs");

var command = new Command("media", (message, bot) => {
	var file = framework.findFile(["./media/"], message.args[0]);
	if(!file) {
		return `Invalid media: \`${message.content}\`, run listmedia to list all media`;
	} else {
		message.channel.sendFile(file.join(""), file[1]);
		return false;
	}
}, {
	type: "default",
	aliases: ["share"],
	description: "Share a peice of media",
	args: [{
		type: "text",
		label: "media name"
	}]
});
