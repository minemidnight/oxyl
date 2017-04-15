const raven = require("raven");
module.exports = (err, id) => {
	raven.setContext({ shard: bot.shards.get(id) });
	if(raven.installed) raven.captureException(err);
};
