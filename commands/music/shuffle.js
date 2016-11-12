const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");

Oxyl.registerCommand("shuffle", "music", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var guild = message.guild;
	var queue = music.data.queue[guild.id];
	if(!voice) {
		return "you and Oxyl must be in the same voice channel to toggle repeating";
	} else if(!queue) {
		return "there is currently no queue";
	} else if(queue.length < 1) {
		return "there are not enough songs to shuffle";
	} else {
		queue = queue.sort(() => 0.5 - Math.random());
		return "queue shuffled";
	}
}, [], "Shuffle the songs in queue", "[]");
