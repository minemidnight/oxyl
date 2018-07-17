module.exports = async (message, id, next) => {
	process.logger.warn("shard", `Shard ${id} recieved warning: ${message}`);

	return next();
};
