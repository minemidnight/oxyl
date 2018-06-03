const config = require("../../../config");
const { PlayerManager } = require("eris-lavalink");

module.exports = (next, wiggle) => {
	process.send({ op: "ready" });

	if(!(wiggle.erisClient.voiceConnections instanceof PlayerManager)) {
		wiggle.erisClient.voiceConnections = new PlayerManager(wiggle.erisClient, config.lavalink.nodes, {
			numShards: wiggle.erisClient.options.maxShards,
			userId: wiggle.erisClient.user.id,
			defaultRegion: "us"
		});
	}

	wiggle.erisClient.editStatus("online", { name: `${wiggle.get("prefixes")[0]}help | ${wiggle.locals.shardDisplay}` });
	return next();
};
