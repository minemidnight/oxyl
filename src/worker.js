global.Promise = require("bluebird");
const Eris = require("eris");
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");

const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
const privateConfig = JSON.parse(require("fs").readFileSync("private-config.json").toString());

cluster.worker.on("message", async msg => {
	if(msg.type === "startup") {
		init(msg.shardStart, msg.shardEnd);
	} else if(msg.type === "eval") {
		process.send({ type: "evalResult", output: eval(msg.input) });
	}
});

async function init(shardStart, shardEnd) {
	global.bot = new Eris(privateConfig.token, {
		firstShardId: shardStart,
		lastShardId: shardEnd,
		maxShards: publicConfig.shardsPerWorker,
		disableEvents: { TYPING_START: true },
		messageLimit: 0,
		defaultImageFormat: "png",
		defaultImageSize: 256
	});

	bot.publicConfig = publicConfig;
	bot.privateConfig = privateConfig;
	bot.prefixes = new Map();

	bot.utils = {};
	let utils = await loadScripts(path.resolve("src", "utils"));
	utils.forEach(script => bot.utils[script.name] = script.exports);

	let onceListeners = await loadScripts(path.resolve("src", "listeners", "once"));
	let onListeners = await loadScripts(path.resolve("src", "listeners", "on"));
	onceListeners.forEach(script => bot.once(script.name, script.exports));
	onListeners.forEach(script => bot.on(script.name, script.exports));

	bot.commands = [];
	const Command = require("./structures/command.js");
	let commands = await loadScripts(path.resolve("src", "commands"), true);
	commands.forEach(script => {
		let finalPath = script.path.dir.substring(script.path.dir.lastIndexOf("/") + 1);
		script.exports.name = script.name;
		script.exports.type = finalPath;

		let command = new Command(script.exports);
		bot.commands.push(command);
	});

	bot.connect();
}

async function loadScripts(filepath, deep = false) {
	if(!fs.existsSync(filepath)) return [];

	let scripts = [];
	let files = await getFiles(filepath, file => file.endsWith(".js"), deep);

	files.forEach(file => {
		scripts.push({
			name: file.substring(file.lastIndexOf("/") + 1, file.length - 3),
			exports: require(file),
			path: path.parse(file)
		});
	});

	return scripts;
}

async function getFiles(filepath, filter = () => true, deep = false) {
	let files = await fs.readdirAsync(filepath);
	let validFiles = [];

	for(let file of files) {
		if(deep) {
			let stats = await fs.lstatAsync(`${filepath}/${file}`);
			if(stats.isDirectory()) validFiles = validFiles.concat(await getFiles(`${filepath}/${file}`, filter, deep));
		}

		if(filter(file)) validFiles.push(`${filepath}/${file}`);
	}

	return validFiles;
}

process.on("unhandledRejection", err => {
	console.log(err.stack);
});
