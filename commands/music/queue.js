const music = Oxyl.modScripts.music;
exports.cmd = new Oxyl.Command("queue", async message => {
	let guild = message.channel.guild;
	let manager = music.getManager(guild);

	if(!manager) {
		return "There is currently no music playing";
	} else {
		let queue = manager.data.queue;
		let queueSize = queue.length;
		let page = message.args[0] || 1;
		let pageAmount = Math.ceil(queueSize / 15);
		if(page > pageAmount) page = pageAmount;

		let queueMsg = `Music Info for **${guild.name}**\n`;
		queueMsg += `\nQueue **(${queueSize})**`;

		if(queueSize > 0) {
			let queueSongs = [];
			for(let i = 0; i < 15; i++) {
				let index = ((page - 1) * 15) + i;
				let queueData = queue[index];

				let title = queueData.title;
				if(title && title.length > 75) title = `${title.substring(0, 71)} __**...**__`;

				queueSongs.push(`[${index + 1}] ${title}`);
				if(queueSize - 1 === index || i === 14) break;
			}
			queueSongs = framework.listConstructor(queueSongs);
			queueMsg += `${queueSongs}\nPage ${page} of ${pageAmount}`;
		} else {
			queueMsg += `\nN/A`;
		}

		if(!manager.data.playing || !manager.connection || !manager.connection.current) {
			queueMsg += `\n\nPlaying: Nothing (Still queueing?)`;
		} else {
			let videoDuration = music.providers.durationFormat(manager.data.playing.duration);
			queueMsg += `\n\nPlaying: ${manager.data.playing.title} **(**${manager.playTime}/${videoDuration}**)**`;
		}

		let repeat = manager.data.extraOptions.repeat ? "on" : "off";
		queueMsg += `\nRepeat: **${repeat}**`;

		return queueMsg;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "List the current guild music queue",
	args: [{
		type: "int",
		label: "page",
		optional: true,
		min: 1
	}]
});
