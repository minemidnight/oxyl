const createMessage = require("./createMessage");
const superagent = require("superagent");
module.exports = redis => {
	setInterval(() => postNew(redis), 15000);
	setInterval(() => postTop(redis), 300000);
};

async function getNew(redis) {
	const validReddits = (await redis.keys("feeds:reddit:new:*"))
		.map(key => key.substring(key.lastIndexOf(":") + 1));
	const alreadyPosted = (await redis.keys("feeds:reddit:newPosted:*"))
		.map(key => key.substring(key.lastIndexOf(":") + 1));

	let { body: { data: { children: newPosts } } } = await superagent.get("https://www.reddit.com/r/all/new.json");
	newPosts = newPosts.map(({ data }) => data)
		.filter(({ subreddit, id }) => ~validReddits.indexOf(subreddit) && !~alreadyPosted.indexOf(id));
	newPosts.forEach(({ id }) => redis.set(`feeds:reddit:newPosted:${id}`, "", "EX", 604800));

	return newPosts;
}

async function getTop(sub, redis) {
	const alreadyPosted = (await redis.keys("feeds:reddit:topPosted:*"))
		.map(key => key.substring(key.lastIndexOf(":") + 1));

	let { body: { data: { children: newPosts } } } = await superagent.get(`https://www.reddit.com/r/${sub}/top.json`);
	newPosts = newPosts.map(({ data }) => data).filter(({ id }) => !~alreadyPosted.indexOf(id));
	newPosts.forEach(({ id }) => redis.set(`feeds:reddit:topPosted:${id}`, "", "EX", 604800));

	return newPosts;
}

function getPostEmbed(post) {
	const embed = {
		author: { name: post.subreddit_name_prefixed },
		timestamp: new Date(post.created * 1000),
		title: post.title,
		url: `https://reddit.com${post.permalink}`
	};

	if(post.selftext) {
		embed.description = post.selftext;
		embed.thumbnail = { url: "https://www.redditstatic.com/icon.png" };
	}

	if(post.post_hint && post.preview.images) {
		embed.image = { url: post.preview.images[0].source.url.replace(/&amp;/g, "&") };
	}

	return embed;
}

async function postNew(redis) {
	const newPosts = await getNew(redis);
	newPosts.forEach(async (post, i1) => {
		const channels = JSON.parse(await redis.get(`feeds:reddit:new:${post.subreddit}`));
		const embed = getPostEmbed(post);

		channels.forEach((channel, i2) => createMessage(channel, embed, (i1 + i2) * 1250));
	});
}

async function postTop(redis) {
	const subreddits = (await redis.keys(`feeds:reddit:top:*`)).map(key => key.substring(key.lastIndexOf(":") + 1));
	subreddits.forEach(async (subreddit, i1) => {
		const channels = JSON.parse(await redis.get(`feeds:reddit:top:${subreddit}`));

		const posts = await getTop(subreddit, redis);
		posts.forEach((post, i2) => {
			const embed = getPostEmbed(post);
			channels.forEach((channel, i3) => createMessage(channel, embed, (i1 + i2 + i3) * 1250));
		});
	});
}
