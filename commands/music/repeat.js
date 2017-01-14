const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("repeat", async (message, bot) => {
	let manager = music.getManager(message.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be in the music channel to run this command";
	} else {
		let newValue = manager.toggleOption("repeat");
		newValue = newValue ? "on" : "off";
		return `Repeat has been turned ${newValue}`;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Toggle repeating of songs",
	aliases: ["loop"]
});
