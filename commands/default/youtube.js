const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("youtube", (message, bot) => {
	let editMsg = message.channel.sendMessage("`Searching...`");
	music.searchVideo(message.argsPreserved[0]).then(res => {
		if(res === "NO_RESULTS") {
			Promise.resolve(editMsg).then(msg => {
				msg.edit(`No results found`);
			});
		} else {
			Promise.resolve(editMsg).then(msg => {
				msg.edit(`Here is the video you searched for: http://youtube.com/watch?v=${res}`);
			});
		}
	}).catch(() => {
		Promise.resolve(editMsg).then(msg => {
			msg.edit(`Error contating the Youtube API`);
		});
	});
}, {
	type: "default",
	aliases: ["yt"],
	description: "Search a youtube query",
	args: [{
		type: "text",
		label: "query"
	}]
});
