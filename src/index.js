const cluster = require("cluster");
if(cluster.isMaster) require("./cluster/master");
else require("./cluster/worker");

process.on("unhandledRejection", err => {
	if(process.logger) process.logger.error("error", err.stack);

	process.exit(1);
});
