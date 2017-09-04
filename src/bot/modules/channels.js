const redis = bot.utils.redis;
module.exports = {
	enabled: async guildID => {
		let enabled = r.table("settings").get(["channels", guildID]).run();
		return enabled ? enabled.value : false;
	},
	get: async member => {
		let channel = await redis.get(`channels:${member.guild.id}:${member.id}`);
		if(channel && member.guild.channels.has(channel)) channel = member.guilds.channels.get(channel);
		return channel;
	},
	memberFromChannel: async channel => {
		let member = await redis.get(`channelMemberMap:${channel.id}`);
		if(member && channel.guild.members.has(member)) member = channel.guild.members.get(member);
		return member;
	},
	create: async (member, name) => {
		let channel = await bot.createChannel(member.guild.id, name, 2,
			`Channel command (owned by ${member.user.username}#${member.user.discriminator})`);
		await bot.editChannelPermission(channel.id, member.id, 16, 0, "member",
			`Channel command (owned by ${member.user.username}#${member.user.discriminator})`);

		await redis.set(`channels:${member.guild.id}:${member.id}`, channel.id, "EX", 86400);
		await redis.set(`channelMemberMap:${channel.id}`, member.id, "EX", 86400);
		channel.deleteTimeout = setTimeout(() => channels.delete(channelOwner), 300000);
		return channel;
	},
	delete: async member => {
		let channel = await module.exports.get(member);
		await redis.del(`channels:${member.guild.id}:${member.id}`);
		await redis.del(`channelMemberMap:${channel.id || channel}`);

		if(channel && typeof channel === "object") await channel.delete();
	}
};
