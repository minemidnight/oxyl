const levels = ["error", "warn", "info", "debug", "startup"];
const Logger = require("./Logger");

module.exports = r => levels.reduce((loggers, level) => {
	const logger = new Logger(level, r);
	loggers[level] = logger.log.bind(logger);

	return loggers;
}, {});
