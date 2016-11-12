const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	fs = require("fs");

var mediaPath = "./media/";

function checkMedia(name) {
	var media = fs.readdirSync(`${mediaPath}`), mediaExt;
	media.forEach(mediaFile => {
		var extIndex = mediaFile.lastIndexOf(".");
		var baseName = mediaFile.substring(0, extIndex);
		var extType = mediaFile.substring(extIndex + 1);
		if(baseName === name) {
			mediaExt = extType;
		}
	});
	return mediaExt;
}

Oxyl.registerCommand("media", "default", (message, bot) => {
	if(!message.content) {
		return "please provide a media to share, run listmedia to list all media";
	} else {
		var ext = checkMedia(message.content);
		if(!ext) {
			return `invalid media: \`${message.content}\`, run listmedia to list all media`;
		} else {
			message.channel.sendFile(`${mediaPath}${message.content}.${ext}`, `${message.content}.${ext}`);
		}
	}
	return false;
}, ["share"], "Share a peice of media", "<media name>");
