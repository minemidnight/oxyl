const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("stop", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var guild = message.guild;
	if(!voice) {
		return "you and Oxyl must both be in the same channel to stop the music";
	} else {
		voice.leave();
		music.clearData(guild);
		return `Stopped the music in ${voice.name}`;
	}
}, {
	type: "music",
	aliases: ["end"],
	description: "Stop the music in your channel"
});
