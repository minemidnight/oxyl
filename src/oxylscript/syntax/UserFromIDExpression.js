module.exports = async function(_a, _b, _c, id) {
	return this.guild.shard.client.users.get(await id.run());
};
