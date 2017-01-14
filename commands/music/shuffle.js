const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("shuffle", async (message, bot) => {
	let manager = music.getManager(message.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be in the music channel to run this command";
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
