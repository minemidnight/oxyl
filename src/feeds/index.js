const config = require("../../config");
const r = require("../rethinkdb/index");

process.logger = require("../logger/index")(r);

let Redis;
if(process.env.NODE_ENV === "development") Redis = require("ioredis-mock");
else Redis = require("ioredis");
const redis = new Redis({ db: config.redisDB });

require("./reddit")(redis);
require("./twitch")(redis);

module.exports = async () => {
	let feeds = await r.table("feeds").run();
	feeds = feeds.reduce((a, { id: [service, identifier, channel], type }) => {
		if(type) service = `${service}:${type}`;
		if(!a[service]) a[service] = { [identifier]: [channel] };
		else if(!a[service][identifier]) a[service][identifier] = [channel];
		else a[service][identifier].push(channel);

		return a;
	}, {});

	const multi = redis.multi();
	Object.entries(feeds).forEach(([service, value]) => {
		Object.entries(value).forEach(([identifier, subbed]) => {
			multi.set(`feeds:${service}:${identifier}`, JSON.stringify(subbed), "EX", "2419200");
		});
	});

	await multi.exec();
	process.send({ op: "ready" });
	return { redis };
};
