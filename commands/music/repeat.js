const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");

Oxyl.registerCommand("repeat", "music", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var guild = message.guild;
	var options = music.data.options;
	if(!voice) {
		return "you and Oxyl must be in the same voice channel to toggle repeating";
	} else {
		music.toggleRepeat(guild);
		let newValue = options[guild.id].repeat ? "on" : "off";

		return `turned ${newValue} repeat for **${guild.name}**`;
	}
}, ["loop"], "Toggle repeating of songs", "[]");
