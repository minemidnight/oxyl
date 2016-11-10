const Discord = require("discord.js"),
	music = require("../../modules/music.js"),
	Oxyl = require("../../oxyl.js");

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
				if(res === "NO_RESULTS") {
					Promise.resolve(editMsg).then(msg => {
						msg.edit(`${message.author}, no results found`).then(() => {
							resolve(editMsg);
						});
					});
				} else {
					Promise.resolve(editMsg).then(msg => {
						msg.edit(`${message.author}, found video \`http://youtube.com/watch?v=${res}\``).then(() => {
							resolve(editMsg);
						});
					});
				}
			}).catch(() => {
				Promise.resolve(editMsg).then(msg => {
					msg.edit(`${message.author}, error contating the Youtube API`).then(() => {
						resolve(editMsg);
					});
				});
			});
		} else if(!videoFilter.test(message.content) || !match) {
			message.reply("invalid link given, please only use youtube links (videos or playlists)").then(msg => {
				resolve(msg);
			});
		} else if(match[2]) {
			message.reply(`adding playlist id \`${message.content}\` to the queue`).then(msg => {
				resolve(msg);
			});
		} else {
			message.reply(`getting info from \`${message.content}\` then adding to queue`).then(msg => {
				resolve(msg);
			});
		}
	});
}

Oxyl.registerCommand("play", "music", (message, bot) => {
	let editMsg;
	var voiceChannel = message.member.voiceChannel;
	if(!message.content) {
		return "please provide a youtube link to play or !query";
	} else if(!voiceChannel) {
		return "please be in a voice channel";
	} else if(!voiceChannel.joinable) {
		return "I cannot join that voice channel due to permissions";
	} else {
		playCmdProcess(message).then(msg => {
			if(msg.content.includes("adding playlist")) {
				var playlistFilter = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
				var playlistId = msg.content.match(playlistFilter)[2];
				voiceChannel.join().then(connection => {
					music.addPlaylist(playlistId, message.guild, connection);
				});
			} else {
				let videoId = music.getVideoId(msg.content);
				if(videoId === "INVALID_URL") {
					return;
				} else {
					let url = `http://youtube.com/watch?v=${videoId}`;
					music.addInfo(videoId, message.guild).then((info) => {
						msg.edit(`${message.author}, added \`${info.title}\` to the **${message.guild.name}**'s queue.`);
					});
					voiceChannel.join().then(connection => {
						music.addQueue(url, message.guild, connection);
					});
				}
			}
		});
	}
	return false;
}, [], "Add a youtube video to the music queue", "<yt link>");
