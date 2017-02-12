const music = require("../../modules/music.js");

exports.cmd = new Oxyl.Command("end", async message => {
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
	aliases: ["stop"],
	type: "music",
	description: "Stop the music in your channel"
});
