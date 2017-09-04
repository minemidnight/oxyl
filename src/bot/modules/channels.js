const redis = bot.utils.redis;
module.exports = {
	enabled: async guildID => {
		let enabled = await r.table("settings").get(["channels", guildID]).run();
		return enabled ? enabled.value : false;
	},
	get: async member => {
		let channel = await redis.get(`channels:${member.guild.id}:${member.id}`);
		if(channel && member.guild.channels.has(channel)) channel = member.guild.channels.get(channel);
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
		await bot.editChannelPermission(channel.id, member.id, 1048592, 0, "member",
			`Channel command (owned by ${member.user.username}#${member.user.discriminator})`);

		await redis.set(`channels:${member.guild.id}:${member.id}`, channel.id, "EX", 86400);
		await redis.set(`channelMemberMap:${channel.id}`, member.id, "EX", 86400);
		channel.deleteTimeout = setTimeout(() => module.exports.delete(member), 300000);
		return channel;
	},
	delete: async member => {
		let channel = await module.exports.get(member);
		await redis.del(`channels:${member.guild.id}:${member.id}`);
		await redis.del(`channelMemberMap:${channel.id || channel}`);

		if(channel && typeof channel === "object") await channel.delete();
	},
	load: async () => {
		let keys = await redis.keys(`${redis.options.keyPrefix}channels:*`);
		keys.forEach(async key => {
			let guildID = key.substring(key.indexOf(":", redis.options.keyPrefix.length) + 1, key.lastIndexOf(":"));
			let memberID = key.substring(key.lastIndexOf(":") + 1);
			if(!bot.guilds.has(guildID)) return;
			let guild = bot.guilds.get(guildID);

			let channelID = await redis.get(key.substring(redis.options.keyPrefix.length));
			if(!guild.channels.has(channelID)) {
				module.exports.delete(guild.members.get(memberID));
			} else {
				let channel = guild.channels.get(channelID);
				if(!channel.voiceMembers.filter(voiceMember => !voiceMember.bot).length) {
					channel.deleteTimeout = setTimeout(() => module.exports.delete(guild.members.get(memberID)), 300000);
				}
			}
		});
	}
};
