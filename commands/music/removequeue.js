const music = Oxyl.modScripts.music;
exports.cmd = new Oxyl.Command("removequeue", async message => {
	let guild = message.channel.guild;
	let manager = music.getManager(guild);

	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be listening to music to use this command";
	} else {
		let queue = manager.data.queue;
		if(!queue || queue.length === 0) return "There is nothing queued";
		let removed = [];
		if(message.args[0].indexOf("-") !== -1) {
			let match = message.args[0].match(/(\d+)\s?-\s?(\d+)/);
			match[1] = parseInt(match[1]);
			match[2] = parseInt(match[2]);
			if(match[2] < match[1]) return "Invalid range given!";
			for(let i = match[1]; i < match[2]; i++) removed.push(i);
		} else if(message.args[0].indexOf(",") !== -1) {
			message.args[0].split(",").forEach(int => removed.push(parseInt(int)));
		} else {
			removed.push(parseInt(message.args[0]));
		}

		removed = removed.filter(int => !isNaN(int)).map(int => int - 1);
		removed.forEach(int => delete manager.data.queue[int]);
		manager.data.queue = manager.data.queue.filter(item => item !== undefined);

		return `:white_check_mark: Removed ${removed.length} song${removed.length > 1 ? "s" : ""} from the queue`;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Remove items from the queue",
	args: [{
		type: "text",
		label: "queue #|range|list",
		min: 1
	}]
});
