module.exports = (next, client) => {
	process.send({ op: "ready" });

	client.erisClient.editStatus("online", { name: `${client.get("prefixes")[0]}help | ${client.locals.shardDisplay}` });
	return next();
};
