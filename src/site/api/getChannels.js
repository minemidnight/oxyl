module.exports = async id => await process.output({
	op: "eval",
	target: "guild",
	targetValue: id,
	input: () => {
		const client = context.client.erisClient; // eslint-disable-line no-undef
		const guild = client.guilds.get(message.targetValue); // eslint-disable-line no-undef

		return guild.channels.filter(({ type }) => type === 0).sort((a, b) => a.position - b.position).map(channel => ({
			id: channel.id,
			name: channel.name,
			canSend: channel.permissionsOf(client.user.id).has("sendMessages") &&
					channel.permissionsOf(client.user.id).has("readMessages")
		}));
	}
})
;
