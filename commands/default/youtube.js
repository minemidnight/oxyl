const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("youtube", async (message, bot) => {
	message.channel.startTyping();

	let video = await music.searchVideo(message.argsPreserved[0]);
	if(video === "NO_RESULTS") return "No results found";
	else return `http://youtube.com/watch?v=${video}`;
}, {
	type: "default",
	aliases: ["yt"],
	description: "Search a youtube query",
	args: [{
		type: "text",
		label: "query"
	}]
});
