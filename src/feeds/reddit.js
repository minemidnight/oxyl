const createMessage = require("./createMessage");
const superagent = require("superagent");
module.exports = redis => {
	setInterval(() => postNew(redis), 15000);
	setInterval(() => postTop(redis), 900000);
};

async function getNew(redis) {
	const validReddits = await redis.keys("feeds:reddit:new:*");
	const alreadyPosted = await redis.keys("feeds:reddit:new:posted:*");

	let { body: { data: { children: newPosts } } } = await superagent.get("https://www.reddit.com/r/all/new.json");
	return newPosts.map(({ data }) => data)
		.filter(({ subreddit, id }) => ~validReddits.indexOf(`feeds:reddit:new:${subreddit}`) &&
			!~alreadyPosted.indexOf(`feeds:reddit:new:posted:${id}`))
		.forEach(({ id }) => redis.set(`feeds:reddit:new:posted:${id}`, "", "EX", 604800));
}

async function getTop(sub, redis) {
	const validReddits = await redis.keys("feeds:reddit:top:*");
	const alreadyPosted = await redis.keys("feeds:reddit:new:posted:*");

	let { body: { data: { children: newPosts } } } = await superagent.get(`https://www.reddit.com/r/${sub}.json`);
	return newPosts.map(({ data }) => data)
		.filter(({ subreddit, id }) => ~validReddits.indexOf(`feeds:reddit:top:${subreddit}`) &&
			!~alreadyPosted.indexOf(`feeds:reddit:new:posted:${id}`))
		.forEach(({ id }) => redis.set(`feeds:reddit:new:posted:${id}`, "", "EX", 604800));
}

function getPostEmbed(post) {
	const embed = {
		title: post.title,
		url: `https://reddit.com${post.permalink}`,
		timestamp: post.created
	};

	if(post.selftext) embed.description = post.selftext;
	if(post.post_hint && post.preview.images) embed.image = { url: post.preview.images[0].source.url };

	return embed;
}

async function postNew(redis) {
	const newPosts = await getNew(redis);
	newPosts.forEach(async post => {
		const channels = JSON.parse(await redis.get(`feeds:reddit:new:${post.subreddit}`));
		const embed = getPostEmbed(post);

		channels.forEach(channel => createMessage(channel, embed));
	});
}

async function postTop(redis) {
	const newPosts = await getTop(redis);
	newPosts.forEach(async post => {
		const channels = JSON.parse(await redis.get(`feeds:reddit:top:${post.subreddit}`));
		const embed = getPostEmbed(post);

		channels.forEach(channel => createMessage(channel, embed));
	});
}
