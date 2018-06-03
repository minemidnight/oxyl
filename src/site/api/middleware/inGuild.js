module.exports = async id => await process.output({
	op: "eval",
	target: "guild",
	targetValue: id,
	input: "return context.client.erisClient.guilds.has(message.targetValue)"
});
