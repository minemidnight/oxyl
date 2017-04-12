module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return "There is currently no music playing";
		} else {
			let moves = [];
			let connectionChannel = player.connection.channelID;
			if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
				let memberChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);
				if(memberChannel.id !== connectionChannel) {
					if(!memberChannel.permissionsOf(bot.user.id).has("voiceConnect")) {
						return "I cannot join that channel (no permissions)";
					} else if(!memberChannel.permissionsOf(bot.user.id).has("voiceSpeak")) {
						return "I cannot speak in that channel (no permissions)";
					} else {
						moves.push(memberChannel.name);
						bot.joinVoiceChannel(memberChannel.id);
					}
				}
			} else {
				return "You are not in a voice channel, you cannot use this!";
			}

			if(player.channel.id !== message.channel.id) {
				player.channel = message.channel;
				moves.push(message.channel.mention);
			}

			if(moves.length === 0) return "Nothing to move. Already bound to this voice and text channel";
			else return `Moved to ${moves.join(" and ")}`;
		}
	},
	guildOnly: true,
	description: "Change Oxyl's voice channel and/or text channel"
};
