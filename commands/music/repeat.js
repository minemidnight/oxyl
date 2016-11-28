const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("repeat", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var guild = message.guild;
	var options = music.data.options;
	if(!voice) {
		return "you and Oxyl must be in the same voice channel to toggle repeating";
	} else {
		music.toggleRepeat(guild);
		let newValue = options[guild.id].repeat ? "on" : "off";

		return `turned ${newValue} repeat for **${guild.name}**`;
	}
}, {
	type: "music",
	description: "Toggle repeating of songs",
	aliases: ["loop"]
});
