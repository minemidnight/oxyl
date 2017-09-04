const Redis = require("ioredis");
module.exports = new Redis({ keyPrefix: bot.config.beta ? "oxylbeta:" : "oxyl:" });
