const Discord = require("discord.js"),
	music = require("../modules/music.js"),
	Oxyl = require("./../oxyl.js");

Oxyl.registerCommand("stop", "default", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var guild = message.guild;
	if(!voice) {
		return "you and Oxyl must both be in the same channel to stop the music";
	} else {
		delete music.data.queue[guild.id];
		delete music.data.volume[guild.id];
		delete music.data.current[guild.id];
		voice.leave();
		return `Stopped the music in ${voice.name}`;
	}
}, ["end"], "Stop the music in your channel", "[]");
