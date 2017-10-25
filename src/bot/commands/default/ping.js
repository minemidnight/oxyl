module.exports = {
	run: async ctx => {
		if(ctx.flags.https) {
			const now = Date.now();
			const msg = await ctx.reply(ctx.t("commands.ping", { latency: ctx.t("commands.ping.pinging") }));
			msg.edit(ctx.t("commands.ping", { latency: Date.now() - now }));
			return undefined;
		} else {
			const latency = ctx.guild ? ctx.guild.shard.latency : ctx.channel._client.shards.get(0).latency;
			return ctx.t("commands.ping", { latency });
		}
	},
	flags: [{
		name: "https",
		short: "h",
		type: "boolean",
		default: false,
		aliases: ["http"]
	}]
};
