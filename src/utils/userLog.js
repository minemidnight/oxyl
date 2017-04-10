module.exports = async (guild, member, type) => {
	type = type === "join" ? "greeting" : "farewell";
	let userlog = (await r.table("settings").filter({
		name: "userlog",
		guildID: guild.id
	}).run())[0];
	if(!userlog) return;
	else userlog = userlog.value;

	let message = (await r.table("settings").filter({
		name: type,
		guildID: guild.id
	}).run())[0];
	if(!message) return;
	else message = message.value;

	let user = member.user ? member.user : member;
	message = message.replace(/{{mention}}/g, user.mention)
		.replace(/{{username}}/g, user.username)
		.replace(/{{discrim(inator)?}}/g, user.discriminator)
		.replace(/{{id}}/g, user.id);

	try {
		await bot.createMessage(userlog, message);
	} catch(err) {
		return;
	}
};
