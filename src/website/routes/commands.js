const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

let commands = {};
router.get("/", async (req, res) => {
	let categories = new Set();
	Object.keys(commands).forEach(key => categories.add(commands[key].type));
	res.status(200).send(await req.app.page(req, "commands", { commands, categories: Array.from(categories) })).end();
});

async function updateCommands() {
	let backup = commands;
	commands = (await process.output({
		target: 1,
		input: `return bot.commands`,
		type: "shard"
	})).result;

	if(!commands) commands = backup;
}
setTimeout(updateCommands, 100);
setInterval(updateCommands, 3600000);
