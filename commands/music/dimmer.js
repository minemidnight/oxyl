const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("dimmer", (message, bot) => {
	var voice = music.voiceCheck(message.member);
	var guild = message.guild;
	var options = music.data.options;
	if(!voice) {
		return "you and Oxyl must be in the same voice channel to toggle the dimmer";
	} else {
		music.toggleDimmer(guild);
		let newValue = options[guild.id].dimmer ? "on" : "off";

		return `turned ${newValue} dimmer for **${guild.name}**`;
	}
}, {
	type: "music",
	description: "Toggle music dimmer (sound gets lower when others talk)"
});
