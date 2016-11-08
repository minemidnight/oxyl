const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js"),
	fs = require("fs");

var mediaPath = "./media/";

Oxyl.registerCommand("listmedia", "default", (message, bot) => {
	var media = fs.readdirSync(`${mediaPath}`), mediaList = [];
	media.forEach(medFile => {
		var extIndex = medFile.lastIndexOf(".");
		var baseName = medFile.substring(0, extIndex);
		mediaList.push(baseName);
	});
	mediaList = mediaList.sort();
	return `all media **(**${mediaList.length}**)**:` +
         "\n```\n" +
         `${mediaList.join(", ")}` +
         "\n```";
}, ["medialist"], "List all shareable media", "[]");
