module.exports = {
	async run({ channel, flags: { https }, guild, reply, t }) {
		if(https) {
			const now = Date.now();
			const msg = await reply(t("commands.ping", { latency: t("commands.ping.pinging") }));
			msg.edit(t("commands.ping", { latency: Date.now() - now }));
			return undefined;
		} else {
			const latency = guild ? guild.shard.latency : channel._client.shards.get(0).latency;
			return t("commands.ping", { latency });
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
