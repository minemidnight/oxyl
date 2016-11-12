const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");

Oxyl.registerCommand("skip", "music", (message, bot) => {
	let guild = message.guild;
	let voice = music.voiceCheck(message.member);
	let connection = voice.connection;
	if(!voice) {
		return "you and Oxyl must both be in the same channel to skip the song";
	} else if(!music.data.current[guild.id]) {
		return "there is no song currently playing";
	} else {
		const ytInfo = music.data.ytinfo[guild.id];
		const queue = music.data.queue[guild.id];
		var videoId = queue[0];
		music.endStream(guild);
		if(queue && videoId) {
			return `now playing \`${ytInfo[videoId].title}\``;
		} else {
			return `no more songs in queue`;
		}
	}
}, [], "Skip a song in your channel");
