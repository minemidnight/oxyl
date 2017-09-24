const superagent = require("superagent");
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

const config = require(`${__dirname}/../config.json`);
async function init() {
	await (require("./misc/rethink")).init();
	const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot")
		.set("Authorization", config.bot.token);
	process.totalShards = totalShards;

	let shardsPerWorker, fields = [];
	fields.push({ name: "Total Shards", value: totalShards });

	const coreCount = require("os").cpus().length;
	if(coreCount >= totalShards) shardsPerWorker = 1;
	else shardsPerWorker = Math.ceil(totalShards / coreCount);
	fields.push({ name: "Shards per Worker", value: shardsPerWorker });

	const workerCount = Math.ceil(totalShards / shardsPerWorker);
	fields.push({ name: "Total Workers", value: workerCount });
	for(let i = 0; i < workerCount; i++) {
		let shardStart = i * shardsPerWorker, shardEnd = ((i + 1) * shardsPerWorker) - 1;
		if(shardEnd > totalShards - 1) shardEnd = totalShards - 1;
		let shardRange = shardStart === shardEnd ? `shard ${shardStart}` : `shards ${shardStart}-${shardEnd}`;

		const worker = cluster.fork();
		Object.assign(worker, { type: "bot", shardStart, shardEnd, shardRange, totalShards });
		handleWorker(worker);
	}

	if(!config.beta && config.website) {
		const website = cluster.fork();
		Object.assign(website, { type: "website" });
		handleWorker(website);
		fields.push({ name: "Website", value: `Website hosted on worker ${website.id}` });
	}

	webhook({
		title: `Master Started up`,
		color: 0x00FF00,
		fields,
		timestamp: new Date()
	});
}
init();
