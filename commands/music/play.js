const music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const ytReg = framework.config.options.music.youtubeRegex;

var cancelFilter = (newMsg, oldMsg) => {
	if(newMsg.author.id === oldMsg.author.id && newMsg.content.toLowerCase() === "cancel") {
		return true;
	} else if(newMsg.author.id === oldMsg.author.id && newMsg.content.toLowerCase() === "continue") {
		return true;
	} else {
		return false;
	}
};

function handleInlineSearch(message, editMsg, res) {
	return new Promise((resolve, reject) => {
		if(res === "NO_RESULTS") {
			Promise.resolve(editMsg).then(msg => {
				msg.edit(`No results found`)
				.then(value => resolve(value));
			});
		} else {
			Promise.resolve(editMsg).then(msg => {
				music.videoInfo(res).then(info => {
					msg.edit(`Adding __${info.title}__ (<http://youtube.com/watch?v=${info.id}>) to **${message.guild.name}**'s queue.`)
					.then(value => resolve(value));
				});
			});
		}
	});
}

function playCmdProcess(message) {
	let editMsg, query = message.argsPreserved[0];

	let type = music.ytType(query);
	return new Promise((resolve, reject) => {
		if(type === "NONE") {
			editMsg = message.channel.createMessage(`Searching \`${query}\` then playing result`);
			music.searchVideo(query).then(res => {
				handleInlineSearch(message, editMsg, res)
				.then(value => resolve(value));
			});
		} else if(type === "PLAYLIST") {
			message.channel.createMessage(`Adding playlist to queue: \`${query}\``)
			.then(value => resolve(value));
		} else if(type === "VIDEO") {
			message.channel.createMessage(`Getting video title of: \`${query}\``).then(msg => {
				music.videoInfo(query).then(info => {
					msg.edit(`Adding __${info.title}__ (<http://youtube.com/watch?v=${info.id}>) to **${message.guild.name}**'s queue.`)
					.then(value => resolve(value));
				}).catch(reason => "Failed to get video info");
			});
		}
	});
}

var command = new Command("play", (message, bot) => {
	let voiceChannel, editMsg, manager = music.getManager(message.guild);
	if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
		voiceChannel = message.guild.channels.get(message.member.voiceState.channelID);
	} else {
		voiceChannel = undefined;
	}

	if(!voiceChannel && !(!manager || !manager.connection)) {
		return "You are not in a voice channel";
	} else if(!manager) {
		manager = new music.Manager(message.guild);
	}

	if(manager && manager.connection && !manager.voiceCheck(message.member)) {
		return "You must be in the music channel to run this command";
	} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceConnect")) {
		return "I cannot join that channel";
	} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceSpeak")) {
		return "I cannot speak in that channel";
	} else {
		playCmdProcess(message).then(msg => {
			var type = music.ytType(msg.content);
			let id = music.ytID(msg.content);
			if(id === "INVALID_URL" || type === "NONE") return;

			msg.edit(`${msg.content}\n\n*Reply with cancel in the next 10 seconds or the command will be processed, or continue to play now*`);
			framework.awaitMessages(msg.channel, newMsg => cancelFilter(newMsg, message), { maxMatches: 1, time: 10000 })
			.then(responses => {
				if(responses && responses.length >= 1 && responses[0].content.toLowerCase() === "cancel") {
					msg.edit(`Cancelled play command`);
				} else {
					if(!manager.connection) {
						manager.connect(voiceChannel).then(connection => manager.addQueue(id));
					} else {
						manager.addQueue(id);
					}

					if(type === "PLAYLIST") {
						msg.edit(`Added playlist to **${message.guild.name}**'s queue`);
					} else if(type === "VIDEO") {
						music.videoInfo(id).then(info => {
							msg.edit(`Added __${info.title}__ to **${message.guild.name}**'s queue`);
						});
					}
				}
			});
		});
	}
	return false;
}, {
	type: "music",
	description: "Add a youtube video to the music queue",
	args: [{
		type: "text",
		label: "yt video link/yt playlist link/search query"
	}]
});
