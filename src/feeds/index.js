const config = require("../../config");
const Redis = require("ioredis");
const redis = new Redis({ db: config.redisDB });
const r = require("../rethinkdb/index"); // eslint-disable-line id-length

require("./reddit")(r, redis);
require("./twitch")(r, redis);
require("./twitter")(r, redis);
require("./youtube")(r, redis);

async function init() {
	let feeds = await r.table("feeds").run();
	feeds = feeds.reduce((a, { id: [service, identifier, channel], type }) => {
		if(type) service = `${service}:${type}`;
		if(!a[service]) a[service] = { [identifier]: [channel] };
		else if(!a[service][identifier]) a[service][identifier] = [channel];
		else a[service][identifier].push(type ? [type, channel] : channel);

		return a;
	}, {});

	const multi = redis.multi();
	Object.entries(feeds).forEach((service, value) => {
		Object.entries(value).forEach((identifier, subbed) => {
			multi.set(`feeds:${service}:${identifier}`, JSON.stringify(subbed));
		});
	});

	multi.exec();
}
init();
