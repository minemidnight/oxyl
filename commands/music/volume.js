const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("volume", (message, bot) => {
	let manager = music.getManager(message.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be in the music channel to run this command";
	} else {
		manager.updateVolume(message.args[0]);
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
