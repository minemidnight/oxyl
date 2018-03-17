const cachedCensors = new Map();

async function getCensors(guildID, r) {
	if(cachedCensors.has(guildID)) return cachedCensors.get(guildID);

	const censors = await r.table("censors")
		.getAll(guildID, { index: "guildID" })
		.without("id", "guildID")
		.run();

	cachedCensors.set(guildID, censors);
	setTimeout(() => cachedCensors.delete(guildID), 600000);
	return cachedCensors.get(guildID);
}

module.exports = async (message, next, wiggle) => {
	const censors = await getCensors(message.channel.guild.id, wiggle.locals.r);
	if(!censors.length /* || message.member.permission.has("manageMessages")*/) return next();

	for(const censor of censors) {
		const regex = new RegExp(censor.regex[0], censor.regex[1].join(""));
		if(!regex.test(message.content)) continue;

		await message.delete()
			.catch(err => {}); // eslint-disable-line handle-callback-err, no-empty-function

		await message.channel.createMessage(
			censor.message
				.replace(/{{mention}}/gi, message.author.mention)
				.replace(/{{id(entifier)?}}/gi, message.author.id)
				.replace(/{{discrim(inator)?}}/gi, message.author.discriminator)
				.replace(/{{username}}/gi, message.author.username)
		)
			.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function

		if(censor.action === "role") {
			await message.member.addRole(censor.roleID)
				.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
		} else if(censor.action === "warn") {
			// warn stuff
		} else if(censor.action === "kick") {
			await message.member.kick()
				.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
		} else if(censor.action === "softban") {
			await message.member.ban(7)
				.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function

			await message.member.unban()
				.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
		} else if(censor.action === "ban") {
			await message.member.ban(7)
				.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
		}

		return false;
	}

	return next();
};
