const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("volume", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var volume = parseInt(message.content);
	if(!message.content) {
		return `current volume: ${music.data.volume[message.guild.id]}, please provide a new volume (0-100)`;
	} else if(isNaN(volume)) {
		return "please provide a number between 0 and 100 for the volume";
	} else if(!voice) {
		return "you and Oxyl must be in the same voice channel to set the volume";
	} else {
		music.setVolume(message.guild, volume);
		return `set the volume to ${volume} :sound:`;
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
