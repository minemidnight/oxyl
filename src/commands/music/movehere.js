module.exports = {
	process: async message => {
		let player = bot.players.get(message.channel.guild.id);
		if(!player || !player.connection) {
			return __("phrases.noMusic", message);
		} else {
			let moves = [];
			let connectionChannel = player.connection.channelID;
			if(message.member && message.member.voiceState && message.member.voiceState.channelID) {
				let memberChannel = message.channel.guild.channels.get(message.member.voiceState.channelID);
				if(memberChannel.id !== connectionChannel) {
					if(!memberChannel.permissionsOf(bot.user.id).has("voiceConnect")) {
						return __("phrases.cantJoin", message);
					} else if(!memberChannel.permissionsOf(bot.user.id).has("voiceSpeak")) {
						return __("phrases.cantSpeak", message);
					} else {
						moves.push(memberChannel.name);
						bot.joinVoiceChannel(memberChannel.id);
					}
				}
			} else {
				return __("commands.music.movehere.notInVoice", message);
			}

			if(player.channel.id !== message.channel.id) {
				player.channel = message.channel;
				moves.push(message.channel.mention);
			}

			if(moves.length === 0) return __("commands.music.movehere.nothingToMove", message);
			else return __("commands.music.movehere.success", message, { locations: moves.join(" and ") });
		}
	},
	guildOnly: true,
	description: "Change Oxyl's voice channel and/or text channel"
};
