module.exports = async (message, id, next) => {
	if(typeof id === "function") {
		next = id;
		id = -1;
	}

	process.logger.debug("shard", `Shard ${id}: ${message}`);

	return next();
};
