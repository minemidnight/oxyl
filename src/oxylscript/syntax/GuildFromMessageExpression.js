module.exports = async (_a, _b, _c, message) =>
	(await message.run()).channel.guild;
