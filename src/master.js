const argv = require("args-parser")(process.argv);
const webhook = require("./misc/webhookStatus");

const botHandler = require("./worker_handling/bot");
const siteHandler = require("./worker_handling/site");
function handleWorker(worker) {
	if(worker.type === "bot") botHandler(worker);
	else if(worker.type === "website") siteHandler(worker);
}

Object.defineProperty(cluster, "onlineWorkers", {
	get: () => Object.keys(cluster.workers)
		.map(id => cluster.workers[id])
		.filter(work => work.isConnected())
});

let totalShards = argv.shards || 1;
async function init() {
	await (require("./misc/rethink")).init();
	webhook({
		title: `Master started`,
		color: 0x0000FF,
		timestamp: new Date()
	});

	if(totalShards < 1 || isNaN(totalShards)) totalShards = 1;
	statsd({ type: "gauge", stat: "shards", value: totalShards });

	let shardsPerWorker;
	if(argv.perWorker && argv.perWorker >= 1 && !isNaN(argv.perWorker)) {
		shardsPerWorker = argv.perWorker;
	} else {
		let coreCount = require("os").cpus().length;
		if(coreCount >= totalShards) shardsPerWorker = 1;
		else shardsPerWorker = Math.ceil(totalShards / coreCount);
	}

	const workerCount = Math.ceil(totalShards / shardsPerWorker);
	statsd({ type: "gauge", stat: "workers", value: workerCount });
	for(let i = 0; i < workerCount; i++) {
		let shardStart = i * shardsPerWorker, shardEnd = ((i + 1) * shardsPerWorker) - 1;
		if(shardEnd > totalShards - 1) shardEnd = totalShards - 1;
		let shardRange = shardStart === shardEnd ? `shard ${shardStart}` : `shards ${shardStart}-${shardEnd}`;

		const worker = cluster.fork();
		Object.assign(worker, { type: "bot", shardStart, shardEnd, shardRange, totalShards });
		handleWorker(worker);
	}

	let config = require(require("path").resolve("config.json"));
	if(!config.beta && config.website) {
		const website = cluster.fork();
		Object.assign(website, { type: "website" });
		handleWorker(website);
	}
}
init();
