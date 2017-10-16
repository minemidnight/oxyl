module.exports = {
	run: async ctx => {
		const latency = ctx.guild ? ctx.guild.shard.latency : ctx.channel._client.shards.get(0).latency;
		return ctx.t("commands.ping", { latency });
	}
};
