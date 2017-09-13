module.exports = async (guild, member, type) => {
	type = type === "join" ? "greeting" : "farewell";
	if(type === "greeting") {
		var dm = await r.table("settings").get(["greeting-dm", guild.id]).run();
		dm = dm ? dm.value : false;
	}

	let userlog = await r.table("settings").get(["userlog", guild.id]).run();
	if(!userlog && !dm) return;
	else if(userlog) userlog = userlog.value;

	let message = await r.table("settings").get([type, guild.id]).run();
	if(!message) return;
	else message = message.value;

	let user = member.user ? member.user : member;
	message = message.replace(/{{mention}}/g, user.mention)
		.replace(/{{username}}/g, user.username)
		.replace(/{{discrim(inator)?}}/g, user.discriminator)
		.replace(/{{id}}/g, user.id);

	try {
		if(dm) {
			let channel = await user.getDMChannel();
			await channel.createMessage(message);
		} else {
			await bot.createMessage(userlog, message);
		}
	} catch(err) {
		return;
	}
};
