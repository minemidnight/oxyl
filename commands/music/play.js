const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js");

var cancelFilter = (newMsg, oldMsg) => {
	if(newMsg.author.id === oldMsg.author.id && newMsg.content.toLowerCase() === "cancel") {
		return true;
	} else {
		return false;
	}
};

function handleInlineSearch(message, editMsg, res) {
	return new Promise((resolve, reject) => {
		if(res === "NO_RESULTS") {
			Promise.resolve(editMsg).then(msg => {
				msg.edit(`${message.author}, no results found`).then(() => {
					resolve(editMsg);
				});
			});
		} else {
			Promise.resolve(editMsg).then(msg => {
				music.addInfo(res, message.guild).then((info) => {
					msg.edit(`${message.author}, adding __${info.title}__ (\`http://youtube.com/watch?v=${res}\`) to the **${message.guild.name}**'s queue.`)
					.then(editedMsg => resolve(editedMsg));
				});
			});
		}
	});
}

function playCmdProcess(message) {
	let editMsg;
	var videoFilter = "(?:http://)?(?:www.)?(?:youtube.com|youtu.be)/(?:watch\?)?([^\s]+?)";
	videoFilter = new RegExp(videoFilter);
	var playlistFilter = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
	var match = message.content.match(playlistFilter);
	return new Promise((resolve, reject) => {
		if(message.content.charAt(0) === "!") {
			message.content = message.content.slice(1);
			editMsg = message.reply(`searching \`${message.content}\` then playing result`);
			music.searchVideo(message.content).then(res => {
				handleInlineSearch(message, editMsg, res)
				.then(value => resolve(value));
			});
		} else if(!videoFilter.test(message.content) || !match) {
			message.reply("invalid link given, please only use youtube links (videos or playlists)").then(msg => {
				resolve(msg);
			});
		} else if(match[2]) {
			message.reply(`adding playlist to queue: \`${message.content}\``).then(msg => {
				resolve(msg);
			});
		} else {
			message.reply(`getting video title of: \`${message.content}\``).then(msg => {
				let videoId = music.getVideoId(msg.content);
				music.addInfo(videoId, message.guild).then((info) => {
					msg.edit(`${message.author}, adding __${info.title}__ (\`http://youtube.com/watch?v=${videoId}\`) to the **${message.guild.name}**'s queue.`)
					.then(editedMsg => resolve(editedMsg));
				});
			});
		}
	});
}

Oxyl.registerCommand("play", "music", (message, bot) => {
	let editMsg;
	var voiceChannel = message.member.voiceChannel;
	if(!message.content) {
		return "please provide a youtube link, playlist, or !query to play";
	} else if(!voiceChannel) {
		return "please be in a voice channel";
	} else if(!voiceChannel.joinable) {
		return "I cannot join that voice channel due to permissions";
	} else {
		playCmdProcess(message).then(msg => {
			let videoId = music.getVideoId(msg.content);
			if(videoId === "INVALID_URL" && !msg.content.includes("adding playlist")) {
				return;
			}
			msg.edit(`${msg.content}\n\n*Reply with cancel in the next 10 seconds or the command will be processed*`);
			msg.channel.awaitMessages(newMsg => cancelFilter(newMsg, message), { maxMatches: 1, time: 10000 })
			.then((responses) => {
				if(responses && responses.size === 1 && responses.first().content.toLowerCase() === "cancel") {
					msg.edit(`${message.author}, cancelled play command`);
					delete music.data.ytinfo[msg.guild.id][videoId];
				} else if(msg.content.includes("adding playlist")) {
					var playlistFilter = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
					var playlistId = msg.content.match(playlistFilter)[2];

					voiceChannel.join().then(connection => {
						music.addPlaylist(playlistId.replace("`", ""), message.guild, connection);
					});
				} else {
					var info = music.data.ytinfo[msg.guild.id][videoId];

					msg.edit(`${message.author}, added __${info.title}__ to the **${message.guild.name}**'s queue.`);
					voiceChannel.join().then(connection => {
						music.addQueue(videoId, message.guild, connection);
					});
				}
			});
		});
	}
	return false;
}, [], "Add a youtube video to the music queue", "<yt link/playlist link/!query>");
