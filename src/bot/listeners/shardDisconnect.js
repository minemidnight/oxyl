module.exports = async (error, id, next) => {
	if(error) process.logger.error("shard", `Shard ${id} disconnected with error ${error.stack}`);
	else process.logger.warn("shard", `Shard ${id} disconnected`);

	return next();
};
