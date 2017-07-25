module.exports = {
	process: async message => {
		let ignored = bot.ignoredChannels.has(message.channel.id);
		if(ignored) {
			bot.ignoredChannels.delete(message.channel.id);
			await r.table("ignoredChannels").get(message.channel.id).delete().run();

			return __("commands.admin.ignore.enabled", message, { channel: message.channel.mention });
		} else {
			bot.ignoredChannels.set(message.channel.id, message.channel.guild.id);
			await r.table("ignoredChannels").insert({
				channelID: message.channel.id,
				guildID: message.channel.guild.id
			}).run();

			return __("commands.admin.ignore.disabled", message, { channel: message.channel.mention });
		}
	},
	guildOnly: true,
	description: "Toggle Oxyl in a certain channel"
};
