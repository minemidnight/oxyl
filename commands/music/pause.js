const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("pause", (message, bot) => {
	var voice = music.voiceCheck(message.member);

	if(!voice) {
		return "You and Oxyl must both be in the same channel to pause the music";
	} else if(music.getDispatcher(message.guild).paused) {
		return "The music is already paused";
	} else {
		music.pauseStream(message.guild);
		return `Paused the music in ${voice.name} :pause_button:`;
	}
}, {
	type: "music",
	description: "Pause the music in your channel"
});
