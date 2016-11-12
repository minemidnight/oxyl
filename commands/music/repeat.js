const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js");

Oxyl.registerCommand("repeat", "music", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var guild = message.guild;
	var options = music.data.options;
	if(!voice) {
		return "you and Oxyl must be in the same voice channel to toggle repeating";
	} else {
		var newValue;
		if(!options[guild.id] || options[guild.id].repeat === null) {
			music.setRepeat(guild, true);
			newValue = "on";
		} else {
			music.setRepeat(guild, false);
			newValue = "off";
		}

		return `turned ${newValue} repeat for **${guild.name}**`;
	}
}, ["loop"], "Toggle repeating of songs", "[]");
