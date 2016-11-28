const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	fs = require("fs");

var command = new Command("media", (message, bot) => {
	if(!message.content) {
		return "please provide a media to share, run listmedia to list all media";
	} else {
		var file = framework.findFile(["./media/"], message.content);
		if(!file) {
			return `invalid media: \`${message.content}\`, run listmedia to list all media`;
		} else {
			message.channel.sendFile(file.join(""), file[1]);
		}
	}
	return false;
}, {
	type: "default",
	aliases: ["share"],
	description: "Share a peice of media",
	args: [{
		type: "text",
		label: "media name"
	}]
});
