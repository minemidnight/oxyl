const config = require("../../config");
const createMessage = require("./createMessage");
const fs = require("fs");
const FeedParser = require("feedparser");
const nodemailer = require("nodemailer");
const path = require("path");
const superagent = require("superagent");

const html = fs.readFileSync(path.resolve(__dirname, "assets", "newsletter.html"), "utf8");

const feed = new FeedParser();
const transporter = nodemailer.createTransport({
	port: 465,
	secure: true,
	tls: { rejectUnauthorized: false },
	host: config.mail.host,
	auth: {
		user: config.mail.username,
		pass: config.mail.password
	}
});

async function getPosts(redis, r) {
	const posts = [];

	superagent.get("https://medium.com/feed/oxyl").pipe(feed);
	feed.on("error", error => process.logger.error("medium", error.stack));
	feed.on("readable", function () {
		let item = this.read();

		while(item !== null) {
			posts.push(item);
			item = this.read();
		}
	});

	feed.on("end", async () => {
		const alreadyPosted = (await redis.keys("feeds:medium:*"))
			.map(key => key.substring(key.lastIndexOf(":") + 1));

		for(const post of posts) {
			if(Date.now() - new Date(post.pubdate).getTime() > 86400000) continue;
			else if(alreadyPosted.includes(post.guid)) continue;

			const newsletters = await r.table("newsletter")
				.run();

			newsletters.forEach((newsletter, i) => {
				if(newsletter.dm.enabled) {
					createMessage(newsletter.dm.channelID,
						{ content: `**Oxyl Newsletter** - ${post.title}\n\n${post.link}` },
						i * 1250);
				}

				if(newsletter.email.enabled) {
					transporter.sendMail({
						from: config.mail.username,
						to: newsletter.email.address,
						subject: `Oxyl Newsletter - ${post.title}`,
						text: `New post from the developers of Oxyl: ${post.link}`,
						html: html.replace(/\{\{\s*title\s*\}\}/g, post.title)
							.replace(/\{\{\s*link\s*\}\}/g, post.link)
							.replace(/\{\{\s*unsubscribe\s*\}\}/g, `${config.dashboardURL}?unsubscribe=true`),
						// headers: { "List-Unsubscribe": `<mailto:newsletter@oxyl.website?subject=unsubscribe>` },
						attachments: [{
							filename: "flask.png",
							path: path.resolve(__dirname, "assets", "flask.png"),
							cid: "flask@oxyl.website"
						}]
					});
				}
			});

			await redis.set(`feeds:medium:${post.guid}`, "", "EX", 86400);
		}
	});
}

module.exports = (redis, r) => {
	getPosts(redis, r);
	setInterval(() => getPosts(redis, r), 3600000);
};
