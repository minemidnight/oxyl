const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

let emojis = {};
router.get("/", async (req, res) => {
	let displayEmojis = emojis;
	if(req.query.search) displayEmojis = displayEmojis.filter(emoji => ~emoji.name.indexOf(req.query.search));

	let page = req.query.page ? parseInt(req.query.page) : 1;
	let totalPages = Math.ceil(displayEmojis.length / 1500);
	if(page > totalPages) page = totalPages;

	res.status(200).send(await req.app.page(req, "emojis", {
		emojis: displayEmojis.slice((page - 1) * 750, page * 750),
		page,
		totalPages,
		prevPage: page - 1,
		nextPage: page + 1 > totalPages ? false : page + 1
	})).end();
});

async function updateEmojis() {
	let backup = emojis;
	emojis = (await process.output({
		input: `return Array.from(bot.guilds.values())` +
			`.map(g => g.emojis.map(e => ({ id: e.id, name: e.name })))` +
			`.reduce((a, b) => a.concat(b))`,
		type: "all_shards"
	})).results.reduce((a, b) => a.concat(b), []);

	if(!emojis) emojis = backup;
}
setTimeout(updateEmojis, 100);
setInterval(updateEmojis, 3600000);
