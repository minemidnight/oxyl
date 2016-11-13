const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	fs = require("fs");

Oxyl.registerCommand("media", "default", (message, bot) => {
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
}, ["share"], "Share a peice of media", "<media name>");
