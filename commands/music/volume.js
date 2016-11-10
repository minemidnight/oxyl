const Discord = require("discord.js"),
	music = require("../modules/music.js"),
	Oxyl = require("./../oxyl.js");

Oxyl.registerCommand("volume", "default", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var volume = parseInt(message.content);
	if(!message.content) {
		return `current volume: ${music.data.volume[message.guild.id]}, please provide a new volume (0-100)`;
	} else if(isNaN(volume)) {
		return "please provide a number between 0 and 100 for the volume";
	} else if(!voice) {
		return "you and Oxyl must be in the same voice channel to set the volume";
	} else {
		if(volume > 100) {
			volume = 100;
		} else if(volume < 0) {
			volume = 0;
		}
		music.setVolume(message.guild, volume);
		return `set the volume to ${volume}`;
	}
}, ["vol"], "Change the volume of music being played", "<volume>");
