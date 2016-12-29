const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const perPage = framework.config.options.commands.queueListPerPage;

var command = new Command("queue", (message, bot) => {
	let guild = message.guild;
	let manager = music.getManager(guild);

	if(!manager) {
		return "There is currently no music playing";
	} else {
		let queue = manager.data.queue;
		let queueSize = queue.length;
		let page = 1 || message.args[0];
		let pageAmount = Math.ceil(queueSize / perPage);
		if(page > pageAmount) page = pageAmount;

		let queueMsg = `Music Info for **${guild.name}**\n`;
		queueMsg += `\nQueue **(${queueSize})**`;

		if(queueSize > 0) {
			let queueSongs = [];
			for(let i = 0; i < perPage; i++) {
				let index = ((page - 1) * perPage) + i;
				let queueData = queue[index];

				let title = queueData.title;
				if(title.length > 75) title = `${title.substring(0, 71)} __**...**__`;

				queueSongs.push(`[${index + 1}] ${title}`);
				if(queueSize - 1 === index || i === perPage - 1) break;
			}
			queueSongs = framework.listConstructor(queueSongs);
			queueMsg += `${queueSongs}\nPage ${page} of ${pageAmount}`;
		} else {
			queueMsg += `\nN/A`;
		}

		let videoDuration = music.getDuration(manager.playing.duration);
		let playTime = manager.parsedPlayTime();
		let repeat = manager.data.extraOptions.repeat ? "on" : "off";

		queueMsg += `\n\nVolume: ${manager.data.volume}`;
		queueMsg += `\nRepeat: **${repeat}**`;
		queueMsg += `\n\nPlaying: ${manager.playing.title} **(**${playTime}/${videoDuration}**)**`;

		return queueMsg;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "List the current guild music queue",
	aliases: ["playing", "current"],
	args: [{
		type: "int",
		label: "page",
		optional: true,
		min: 1
	}]
});
