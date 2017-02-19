const music = require("../../modules/music.js");

exports.cmd = new Oxyl.Command("shuffle", async message => {
	let manager = music.getManager(message.channel.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be listening to music to use this command";
	} else {
		let queue = manager.data.queue;
		queue = queue.sort(() => 0.5 - Math.random());
		return "Queue shuffled :arrows_counterclockwise:";
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Shuffle the songs in queue"
});
