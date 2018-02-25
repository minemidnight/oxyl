module.exports = (next, wiggle) => {
	process.send({ op: "ready" });

	wiggle.erisClient.editStatus("online", { name: `${wiggle.get("prefixes")[0]}help | ${wiggle.locals.shardDisplay}` });
	return next();
};
