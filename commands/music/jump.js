const music = require("../../modules/music.js");

exports.cmd = new Oxyl.Command("jump", async message => {
	let guild = message.channel.guild;
	let manager = music.getManager(guild);

	if(!manager) {
		return "There is currently no music playing";
	} else {
		let queue = manager.data.queue;
		if(!queue || queue.length === 0) return "There is nothing queued";
		if(message.args[0] > queue.length) return "Invalid queue number";
		manager.data.queue = queue.slice(message.args[0] - 1).concat(queue.slice(0, message.args[0] - 1));
		manager.connection.stopPlaying();

		return `:white_check_mark: Jumped to queue #${message.args[0]}`;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "List the current guild music queue",
	args: [{
		type: "int",
		label: "queue #",
		min: 1
	}]
});
