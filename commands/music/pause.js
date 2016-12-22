const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("pause", (message, bot) => {
	let manager = music.getManager(message.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be in the music channel to run this command";
	} else if(manager.connection.paused) {
		return "The music is already paused";
	} else {
		manager.pause();
		return "Music paused :pause_button:";
	}
}, {
	type: "music",
	description: "Pause the music in your channel"
});
