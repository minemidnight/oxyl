const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("skip", (message, bot) => {
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
}, {
	type: "music",
	description: "Skip a song in your channel"
});
