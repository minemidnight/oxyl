const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("skip", (message, bot) => {
	let guild = message.guild;
	let voice = music.voiceCheck(message.member);
	let connection = voice.connection;

	if(!voice) {
		return "You and Oxyl must both be in the same channel to skip the song";
	} else if(!music.data.current[guild.id]) {
		return "There is no song currently playing";
	} else {
		const ytInfo = music.data.ytinfo[guild.id];
		const queue = music.data.queue[guild.id];
		var videoId = queue[0];
		music.endStream(guild);
		if(queue && videoId) {
			return `Now playing \`${ytInfo[videoId].title}\``;
		} else {
			return `No more songs in queue`;
		}
	}
}, {
	type: "music",
	description: "Skip a song in your channel"
});
