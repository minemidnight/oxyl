const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js");

Oxyl.registerCommand("skip", "music", (message, bot) => {
	let guild = message.guild;
	let voice = music.voiceCheck(message.member);
	let connection = voice.connection;
	if(!voice) {
		return "you and Oxyl must both be in the same channel to pause the music";
	} else if(!music.data.current[guild.id]) {
		return "there is no music currently playing";
	} else {
		music.endStream(guild);
	}
	return false;
}, [], "Skip a song in your channel");
