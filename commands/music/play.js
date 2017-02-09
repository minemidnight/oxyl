const music = require("../../modules/music.js");
const ytReg = framework.config.options.music.youtubeRegex;

async function playCmdProcess(message) {
	let msg, query = message.argsPreserved[0];
	let type = music.ytType(query);

	if(type === "NONE") {
		msg = await message.channel.createMessage(`Searching \`${query}\` then playing result`);
		let searched = await music.searchVideo(query);

		if(searched === "NO_RESULTS") {
			return await msg.edit(`No results found`);
		} else {
			let info = await music.videoInfo(searched);
			return await msg.edit(`Adding __${info.title}__ (<http://youtube.com/watch?v=${info.id}>) to **${message.channel.guild.name}**'s queue.`);
		}
	} else if(type === "PLAYLIST") {
		return await message.channel.createMessage(`Adding playlist to queue: \`${query}\``);
	} else if(type === "VIDEO") {
		msg = await message.channel.createMessage(`Getting video title of: \`${query}\``);
		let info;
		try {
			info = await music.videoInfo(query);
			return await msg.edit(`Adding __${info.title}__ (<http://youtube.com/watch?v=${info.id}>) to **${message.channel.guild.name}**'s queue.`);
		} catch(err) {
			return await msg.edit("Failed to get video info");
		}
	} else {
		return message.channel.sendMessage("Unknown error");
	}
}

exports.cmd = new Oxyl.Command("play", async message => {
	let voiceChannel, editMsg, manager = music.getManager(message.channel.guild);
	if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
		voiceChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);
	} else {
		voiceChannel = undefined;
	}

	if(!voiceChannel) return "You are not in a voice channel";
	else if(!manager) manager = new music.Manager(message.channel.guild);

	if(manager && manager.connection && !manager.voiceCheck(message.member)) {
		return "You must be in the music channel to run this command";
	} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceConnect")) {
		return "I cannot join that channel";
	} else if(voiceChannel && !voiceChannel.permissionsOf(bot.user.id).has("voiceSpeak")) {
		return "I cannot speak in that channel";
	} else {
		let msg = await playCmdProcess(message);
		var type = music.ytType(msg.content);
		let id = music.ytID(msg.content);
		if(id === "INVALID_URL" || type === "NONE") return "Unknown error";

		await msg.edit(`${msg.content}\n\n*Reply with cancel in the next 10 seconds or the command will be processed, or continue to play now*`);
		let responses = await framework.awaitMessages(msg.channel, newMsg => {
			if(newMsg.author.id !== message.author.id) return false;
			else if(newMsg.content.toLowerCase() === "cancel") return true;
			else if(newMsg.content.toLowerCase() === "continue") return true;
			else return false;
		}, { maxMatches: 1, time: 10000 });

		if(responses && responses.length >= 1 && responses[0].content.toLowerCase() === "cancel") {
			msg.edit(`Cancelled play command`);
		} else {
			if(!manager.connection) {
				await manager.connect(voiceChannel);
				manager.addQueue(id);
			} else {
				manager.addQueue(id);
			}

			if(type === "PLAYLIST") {
				msg.edit(`Added playlist to **${message.channel.guild.name}**'s queue`);
			} else if(type === "VIDEO") {
				let info = await music.videoInfo(id);
				msg.edit(`Added __${info.title}__ to **${message.channel.guild.name}**'s queue`);
			}
		}
		return false;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Add a youtube video to the music queue",
	args: [{
		type: "text",
		label: "yt video link/yt playlist link/search query"
	}]
});
