const music = require("../../modules/music.js");

exports.cmd = new Oxyl.Command("pause", async message => {
	let manager = music.getManager(message.channel.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be listening to music to use this command";
	} else if(manager.connection.paused) {
		return "The music is already paused";
	} else {
		manager.pause();
		return "Music paused :pause_button:";
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Pause the music in your channel"
});
