global.Promise = require("bluebird");
const Eris = require("eris");
const fs = Promise.promisifyAll(require("fs"));

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

	let onceListeners = await loadScripts(`./listeners/once/`);
	let onListeners = await loadScripts(`./listeners/on/`);
	console.log(onceListeners);
	console.log(onListeners);
	onceListeners.forEach(script => bot.once(script.name, script.exports));
	onListeners.forEach(script => bot.on(script.name, script.exports));

	bot.connect();
}

async function loadScripts(path, deep = false) {
	console.log(path, fs.existsSync(path.substring(path.length - 1)));
	if(!fs.existsSync(path)) return [];

	let scripts = [];
	let files = await getFiles(path, file => file.endsWith(".js"), deep);
	console.log(files);

	files.forEach(file => {
		scripts.push({
			name: file.substring(file.length - 3),
			exports: require(`${path}${file}`)
		});
	});

	return scripts;
}

async function getFiles(path, filter = () => true, deep = false) {
	let files = await fs.readdirAsync(path);
	console.log("in getfiles", files);
	let validFiles = [];

	for(let file of files) {
		if(deep) {
			let stats = await fs.lstatAsync(`${path}${file}`);
			if(stats.isDirectory()) files = files.concat(getFiles(`${path}${file}/`, filter, deep));
		}

		if(filter(file)) validFiles.push(file);
	}

	return validFiles;
}
