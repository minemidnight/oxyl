const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("resume", (message, bot) => {
	var voice = music.voiceCheck(message.member);

	if(!voice) {
		return "You and Oxyl must both be in the same channel to resume the music";
	} else if(!music.getDispatcher(message.guild).paused) {
		return "The music is not paused";
	} else {
		music.resumeStream(message.guild);
		return `Resumed the music in ${voice.name} :arrow_forward:`;
	}
}, {
	type: "music",
	description: "Resume the music in your channel"
});
