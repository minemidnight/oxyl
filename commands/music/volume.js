const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("volume", (message, bot) => {
	var voice = music.voiceCheck(message.member);

	if(!voice) {
		return "You and Oxyl must be in the same voice channel to set the volume";
	} else {
		music.setVolume(message.guild, message.args[0]);
		return `Set the volume to ${message.args[0]} :sound:`;
	}
}, {
	aliases: ["vol"],
	type: "music",
	description: "Change the volume of music being played",
	args: [{
		type: "int",
		label: "volume",
		min: 0,
		max: 100
	}]
});
