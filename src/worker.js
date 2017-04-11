const Eris = require("eris");
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");

const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
const privateConfig = JSON.parse(require("fs").readFileSync("private-config.json").toString());

let raven = require("raven");
if(privateConfig.sentryLink) {
	raven.config(privateConfig.sentryLink).install();
	console.startup("Using sentry error handling");
}

cluster.worker.on("message", async msg => {
	if(msg.type === "startup") {
		cluster.worker.shardStart = msg.shardStart;
		cluster.worker.shardEnd = msg.shardEnd;
		cluster.worker.totalShards = msg.totalShards;
		init();
	} else if(msg.type === "eval") {
		try {
			let result = await eval(msg.input);
			process.send({ type: "output", result, id: msg.id });
		} catch(err) {
			process.send({ type: "output", error: err.stack, id: msg.id });
		}
	} else if(msg.type === "output") {
		cluster.worker.emit("outputMessage", msg);
	}
});

async function init() {
	if(!privateConfig.token) {
		console.error("No token found in private-config.json");
		process.exit(0);
	} else if(!publicConfig.prefixes) {
		console.error("No prefix(es) found in public-config.json");
		process.exit(0);
	} else {
		global.bot = new Eris(privateConfig.token, {
			firstShardID: cluster.worker.shardStart,
			lastShardID: cluster.worker.shardEnd,
			maxShards: cluster.worker.totalShards,
			disableEvents: { TYPING_START: true },
			messageLimit: 0,
			defaultImageFormat: "png",
			defaultImageSize: 256
		});
	}

	bot.publicConfig = publicConfig;
	bot.privateConfig = privateConfig;
	bot.ignoredChannels = new Map();
	bot.players = new Map();
	bot.prefixes = new Map();

	bot.utils = {};
	let utils = await loadScripts(path.resolve("src", "utils"));
	utils.forEach(script => bot.utils[script.name] = script.exports);

	let onceListeners = await loadScripts(path.resolve("src", "listeners", "once"));
	let onListeners = await loadScripts(path.resolve("src", "listeners", "on"));
	onceListeners.forEach(script => bot.once(script.name, script.exports));
	onListeners.forEach(script => bot.on(script.name, script.exports));

	bot.commands = {};
	const Command = require("./structures/command.js");
	let commands = await loadScripts(path.resolve("src", "commands"), true);
	commands.forEach(script => {
		let finalPath = script.path.dir.substring(script.path.dir.lastIndexOf("/") + 1);
		script.exports.name = script.name.toLowerCase();
		script.exports.type = finalPath;

		let command = new Command(script.exports);
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
	if(err.message.startsWith("Request timed out")) return;
	try {
		let resp = JSON.parse(err.response);
		// these codes mean someone bamboozled oxyl's perms or someone's bamboozled their server
		if(~[10003, 10008, 40005, 50001, 50013].indexOf(resp.code)) return;
		else throw err;
	} catch(err2) {
		if(raven.installed) raven.captureException(err);
	}
});
