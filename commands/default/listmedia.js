const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	fs = require("fs");
const mediaPath = "./media/";

var command = new Command("listmedia", (message, bot) => {
	var media = fs.readdirSync(`${mediaPath}`), mediaList = [];
	media.forEach(medFile => {
		var extIndex = medFile.lastIndexOf(".");
		var baseName = medFile.substring(0, extIndex);
		mediaList.push(baseName);
	});
	mediaList = mediaList.sort();
	return `Media List (${mediaList.length}): ${framework.codeBlock(mediaList.join(", "))}`;
}, {
	type: "default",
	description: "List all shareable media"
});
