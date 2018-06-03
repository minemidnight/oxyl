module.exports = async (guild, member, next, { erisClient, locals: { r } }) => {
	const userLog = await r.table("userlog")
		.get(guild.id)
		.default({})
		.pluck("channelID", "enabled", "farewell")
		.run();

	if(userLog.enabled) {
		const message = userLog.farewell
			.replace(/{{mention}}/gi, member.mention)
			.replace(/{{id(entifier)?}}/gi, member.id)
			.replace(/{{discrim(inator)?}}/gi, member.discriminator)
			.replace(/{{username}}/gi, member.username);

		erisClient.createMessage(userLog.channelID, message)
			.catch(err => { }); // eslint-disable-line no-empty-function, handle-callback-err
	}

	const toPersist = await r.table("roleSettings")
		.get([guild.id, "rolePersist"])
		.default({ roles: [] })
		.getField("roles")
		.run();

	if(toPersist.length) {
		const persisted = member.roles.filter(roleID => ~toPersist.indexOf(roleID));
		if(persisted.length) {
			await r.table("rolePersist")
				.insert({
					guildID: guild.id,
					id: [guild.id, member.id],
					roles: persisted
				})
				.run();
		}
	}

	return next();
};
