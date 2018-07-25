module.exports = async id => await process.output({
	op: "eval",
	target: "guild",
	targetValue: id,
	input: () => {
		const client = context.client.erisClient; // eslint-disable-line no-undef
		const guild = client.guilds.get(message.targetValue); // eslint-disable-line no-undef

		return [...guild.roles.values()].sort((a, b) => a.position - b.position).slice(1).map(role => ({
			id: role.id,
			name: role.name,
			canGive: role.addable
		}));
	}
});
