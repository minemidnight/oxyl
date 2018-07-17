module.exports = async (mentionable, _a) =>
	(await mentionable.run()).mention;
