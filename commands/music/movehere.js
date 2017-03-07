const music = Oxyl.modScripts.music;
exports.cmd = new Oxyl.Command("movehere", async message => {
	let manager = music.getManager(message.channel.guild);
	if(!manager || !manager.connection) {
		return "There is currently no music playing";
	} else {
		let moves = [];
		let connectionChannel = manager.connection.channelID;
		if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
			let memberChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);
			if(memberChannel.id !== connectionChannel) {
				moves.push(memberChannel.name);
				bot.joinVoiceChannel(memberChannel.id);
			}
		} else {
			return "You are not in a voice channel, you cannot use this!";
		}

		if(manager.channel.id !== message.channel.id) {
			manager.channel = message.channel;
			moves.push(message.channel.mention);
		}

		if(moves.length === 0) return "Nothing to move. Already bound to this voice and text channel";
		else return `Moved to ${moves.join(" and ")}`;
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Change Oxyl's voice channel and/or text channel"
});
