const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("shuffle", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var guild = message.guild;
	var queue = music.data.queue[guild.id];
	if(!voice) {
		return "you and Oxyl must be in the same voice channel to shuffle songs";
	} else if(!queue) {
		return "there is currently no queue";
	} else if(queue.length < 1) {
		return "there are not enough songs to shuffle";
	} else {
		queue = queue.sort(() => 0.5 - Math.random());
		return "queue shuffled";
	}
}, {
	type: "music",
	description: "Shuffle the songs in queue"
});
