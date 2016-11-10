const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js");

Oxyl.registerCommand("resume", "music", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	if(!voice) {
		return "you and Oxyl must both be in the same channel to resume the music";
	} else if(!music.getDispatcher(message.guild).paused) {
		return "the music is not paused";
	} else {
		music.resumeStream(message.guild);
		return `resumed the music in ${voice.name}`;
	}
}, [], "Resume the music in your channel", "[]");
