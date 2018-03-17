module.exports = async (guild, member, next, { erisClient, locals: { r } }) => {
	const autoRoles = await r.table("roleSettings")
		.get([guild.id, "autoRole"])
		.default({ roles: [] })
		.getField("roles")
		.run();

	if(autoRoles.length) {
		autoRoles.forEach(role =>
			member.addRole(role, "Autorole")
				.catch(err => { }) // eslint-disable-line no-empty-function, handle-callback-err
		);
	}

	const userLog = await r.table("userlog")
		.get(guild.id)
		.default({})
		.pluck("channelID", "enabled", "greeting", "dmGreeting")
		.run();

	if(userLog.enabled) {
		const message = userLog.greeting
			.replace(/{{mention}}/gi, member.mention)
			.replace(/{{id(entifier)?}}/gi, member.id)
			.replace(/{{discrim(inator)?}}/gi, member.discriminator)
			.replace(/{{username}}/gi, member.username);

		if(userLog.dmGreeting) {
			message.member.createMesasge(message)
				.catch(err => { }); // eslint-disable-line no-empty-function, handle-callback-err
		} else {
			erisClient.createMessage(userLog.channelID, message)
				.catch(err => { }); // eslint-disable-line no-empty-function, handle-callback-err
		}
	}

	const persistedRoles = await r.table("rolePersist")
		.get([guild.id, member.id])
		.default({ roles: [] })
		.getField("roles")
		.run();

	if(persistedRoles.length) {
		persistedRoles.forEach(role =>
			member.addRole(role, "Role Persist")
				.catch(err => { }) // eslint-disable-line no-empty-function, handle-callback-err
		);

		await r.table("rolePersist")
			.get([guild.id, member.id])
			.delete()
			.run();
	}

	return next();
};
