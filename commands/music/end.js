const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("stop", async (message, bot) => {
	let manager = music.getManager(message.channel.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be in the music channel to run this command";
	} else {
		manager.end();
		return "Music stopped :stop_button:";
	}
}, {
	guildOnly: true,
	type: "music",
	aliases: ["end"],
	description: "Stop the music in your channel"
});
