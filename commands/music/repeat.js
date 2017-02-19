const music = require("../../modules/music.js");

exports.cmd = new Oxyl.Command("repeat", async message => {
	let manager = music.getManager(message.channel.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be listening to music to use this command";
	} else {
		let newValue = manager.toggleOption("repeat") ? "on" : "off";
		return `Repeat has been turned ${newValue}`;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Toggle repeating of songs"
});
