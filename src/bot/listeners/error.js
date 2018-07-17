module.exports = async (error, id, next) => {
	process.logger.error("shard", `Shard ${id}: ${error.stack}`);

	return next();
};
