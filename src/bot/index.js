const Eris = require("eris-additions")(require("eris"),
	{ enabled: ["Channel.awaitMessages", "Member.bannable", "Member.kickable", "Member.punishable", "Role.addable"] }
);

const path = require("path");
const fs = Promise.promisifyAll(require("fs"));
const config = require(path.resolve("config.json"));

let raven = require("raven");
if(config.bot.sentryLink) raven.config(config.bot.sentryLink).install();

async function init() {
	if(!config.bot.token) {
		console.error("No token found in config.json");
		process.exit(0);
	} else if(!config.bot.prefixes) {
		console.error("No prefix(es) found in config.json");
		process.exit(0);
	}

	global.bot = new Eris(config.bot.token, {
		firstShardID: cluster.worker.shardStart,
		lastShardID: cluster.worker.shardEnd,
		maxShards: cluster.worker.totalShards,
		disableEvents: { TYPING_START: true },
		messageLimit: 0,
		defaultImageFormat: "png",
		defaultImageSize: 256
	});

	bot.config = config;
	bot.ignoredChannels = new Map();
	bot.players = new Map();
	bot.prefixes = new Map();
	bot.censors = new Map();

	let locales = await getFiles(path.resolve("locales"), file => file.endsWith(".json"));
	bot.locales = locales.map(file => file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf(".")));
	bot.localeCache = new Map();
	require(path.resolve("src", "misc", "rethink"));
	require(path.resolve("src", "misc", "outputHandler"));
	require(path.resolve("src", "bot", "modules", "locales"));

	bot.utils = {};
	let utils = await loadScripts(path.resolve("src", "bot", "utils"));
	utils.forEach(script => bot.utils[script.name] = script.exports);

	let onceListeners = await loadScripts(path.resolve("src", "bot", "listeners", "once"));
	let onListeners = await loadScripts(path.resolve("src", "bot", "listeners", "on"));
	onceListeners.forEach(script => bot.once(script.name, script.exports));
	onListeners.forEach(script => bot.on(script.name, script.exports));

	bot.commands = {};
	const Command = require(path.resolve("src", "bot", "structures", "command"));
	let commands = await loadScripts(path.resolve("src", "bot", "commands"), true);
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

const statPoster = require(path.resolve("src", "bot", "modules", "statPoster"));
setInterval(statPoster, 1800000);

process.on("unhandledRejection", err => {
	if(err.message && err.message.startsWith("Request timed out")) return;
	try {
		let resp = JSON.parse(err.response);
		// these codes mean someone bamboozled perms
		if(~[0, 10003, 10008, 40005, 50001, 50013].indexOf(resp.code)) return;
		else throw err;
	} catch(err2) {
		if(raven.installed) raven.captureException(err);
		else console.error(err.stack);
	}
});

cluster.worker.on("message", async msg => {
	if(msg.type === "eval") {
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

init();
