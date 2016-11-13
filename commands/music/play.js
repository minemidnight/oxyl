const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");
var ytReg = framework.config.options.music.youtubeRegex;

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
	var type = music.getUrlType(message.content);
	return new Promise((resolve, reject) => {
		if(message.content.charAt(0) === "!") {
			message.content = message.content.slice(1);
			editMsg = message.reply(`searching \`${message.content}\` then playing result`);
			music.searchVideo(message.content).then(res => {
				handleInlineSearch(message, editMsg, res)
				.then(value => resolve(value));
			});
		} else if(type === "NONE") {
			message.reply("invalid link given, please only use youtube links (videos or playlists)").then(msg => {
				resolve(msg);
			});
		} else if(type === "PLAYLIST") {
			message.reply(`adding playlist to queue: \`${message.content}\``).then(msg => {
				resolve(msg);
			});
		} else if(type === "VIDEO") {
			message.reply(`getting video title of: \`${message.content}\``).then(msg => {
				let videoId = music.getVideoId(msg.content);
				music.addInfo(videoId, message.guild).then((info) => {
					msg.edit(`${message.author}, adding __${info.title}__\n(\`http://youtube.com/watch?v=${videoId}\`) to the **${message.guild.name}**'s queue.`)
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
			var type = music.getUrlType(message.content);
			let id = music.getVideoId(msg.content);
			if(id === "INVALID_URL" || type === "NONE") {
				return;
			}

			msg.edit(`${msg.content}\n\n*Reply with cancel in the next 10 seconds or the command will be processed*`);
			msg.channel.awaitMessages(newMsg => cancelFilter(newMsg, message), { maxMatches: 1, time: 10000 })
			.then((responses) => {
				if(responses && responses.size === 1 && responses.first().content.toLowerCase() === "cancel") {
					msg.edit(`${message.author}, cancelled play command`);
					delete music.data.ytinfo[msg.guild.id][id];
				} else if(type === "PLAYLIST") {
					voiceChannel.join().then(connection => {
						music.addPlaylist(id, message.guild, connection);
						msg.edit(`${message.author}, adding playlist \`${id}\` to **${message.guild.name}**'s queue.`);
					});
				} else if(type === "VIDEO") {
					var info = music.data.ytinfo[msg.guild.id][id];

					msg.edit(`${message.author}, added video __${info.title}__ to **${message.guild.name}**'s queue.`);
					voiceChannel.join().then(connection => {
						music.addQueue(id, message.guild, connection);
					});
				}
			});
		});
	}
	return false;
}, [], "Add a youtube video to the music queue", "<yt link/playlist link/!query>");
