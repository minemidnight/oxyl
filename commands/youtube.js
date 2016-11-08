const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js"),
	https = require("https");
const config = Oxyl.config;

Oxyl.registerCommand("youtube", "default", (message, bot) => {
	if(!message.content) {
		return "please provide a query to search for";
	}
	var options = {
		host: "www.googleapis.com",
		path: `/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${escape(message.content)}&key=${config.googleKey}`
	};
	var editMsg = message.reply("`Searching...`");
	var request = https.request(options, (res) => {
		var data = "";
		res.on("data", (chunk) => {
			data += chunk;
		});
		res.on("end", () => {
			if(data.indexOf('videoId') >= 0) {
				data = JSON.parse(data).items[0].id.videoId;
				Promise.resolve(editMsg).then(msg => {
					msg.edit(`here is the video you searched for: http://youtube.com/watch?v=${data}`);
				});
			} else {
				Promise.resolve(editMsg).then(msg => {
					msg.edit("no results found");
				});
			} });
		res.on("error", () => {
			Promise.resolve(editMsg).then(msg => {
				msg.edit("error while contacting Youtube API");
			});
		});
	});
	request.end();
	return false;
}, ["yt"], "Search a youtube query", "<query>");
