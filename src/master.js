const webhook = require("./modules/webhookStatus.js");
const websocket = require("./modules/websocket.js");
const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
const workerCrashes = [];

function handleWorker(worker) {
	worker.on("online", () => {
		console.startup(`Worker ${worker.id} started (hosting shards ${worker.shardStart}-${worker.shardEnd})`);
		worker.send({
			type: "startup",
			shardStart: worker.shardStart,
			shardEnd: worker.shardEnd,
			totalShards: shardCount
		});

		if(process.uptime() >= 30) {
			webhook({
				title: `Worker ${worker.id} started`,
				color: 0x00FF00,
				description: `Hosting shards ${worker.shardStart}-${worker.shardEnd}`,
				timestamp: new Date()
			});
		}

		statsd({
			type: "event",
			stat: "worker_startup",
			value: `Worker ${worker.id}, shards ${worker.shardStart}-${worker.shardEnd}`
		});
	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			return;
		} else if(code !== 0) {
			if(workerCrashes[`${worker.shardStart}-${worker.shardEnd}`] >= 3) {
				console.error(`Worker ${worker.id} killed due to restart loop with ` +
					`exit code: ${code} (hosted shards ${worker.shardStart}-${worker.shardEnd}).`);

				statsd({ type: "event", stat: "worker_exit", value: `Worker ${worker.id} - restart loop` });
				webhook({
					title: `Worker ${worker.id} killed (restart loop)`,
					color: 0xFF0000,
					description: `Exit code: ${code}\nHosted shards ${worker.shardStart}-${worker.shardEnd}`,
					timestamp: new Date()
				});
			} else {
				console.warn(`Worker ${worker.id} died with exit code ${code} ` +
					`(hosting shards ${worker.shardStart}-${worker.shardEnd}). Respawning new process...`);
				const newWorker = cluster.fork();
				newWorker.shardStart = worker.shardStart;
				newWorker.shardEnd = worker.shardEnd;
				handleWorker(newWorker);

				statsd({ type: "event", stat: "worker_exit", value: `Worker ${worker.id} - code ${code} (restarting)` });
				webhook({
					title: `Worker ${worker.id} died`,
					color: 0xFFFF00,
					description: `Exit code: ${code}\nHosting shards ${worker.shardStart}-${worker.shardEnd}\n` +
						`Respawned as ${newWorker.id}`,
					timestamp: new Date()
				});

				if(!workerCrashes[`${worker.shardStart}-${worker.shardEnd}`]) {
					workerCrashes[`${worker.shardStart}-${worker.shardEnd}`] = 1;
				} else {
					workerCrashes[`${worker.shardStart}-${worker.shardEnd}`]++;
				}

				setTimeout(() => {
					if(!workerCrashes[`${worker.shardStart}-${worker.shardEnd}`]) return;
					if(workerCrashes[`${worker.shardStart}-${worker.shardEnd}`] === 1) {
						delete workerCrashes[`${worker.shardStart}-${worker.shardEnd}`];
					} else {
						workerCrashes[`${worker.shardStart}-${worker.shardEnd}`]--;
					}
				}, 120000);
			}
		} else {
			console.info(`Worker ${worker.id} killed successfully ` +
				`(hosted shards ${worker.shardStart}-${worker.shardEnd}).`);

			statsd({ type: "event", stat: "worker_exit", value: `Worker ${worker.id} - successfully exited` });
			webhook({
				title: `Worker ${worker.id} killed`,
				color: 0xFFFF00,
				description: `Exit code: ${code} (success)\nHosted shards ${worker.shardStart}-${worker.shardEnd}`,
				timestamp: new Date()
			});
		}
	});

	worker.on("message", msg => process.handleMessage(msg, worker));
}

Object.defineProperty(cluster, "onlineWorkers", {
	get: () => Object.keys(cluster.workers)
			.map(id => cluster.workers[id])
			.filter(work => work.isConnected())
});

const waitingOutputs = process.waitingOutputs = {};
process.handleMessage = async (msg, worker) => {
	if(msg.type === "masterEval") {
		try {
			let result = await eval(msg.input);
			worker.send({ type: "output", result, id: msg.id });
		} catch(err) {
			worker.send({ type: "output", error: err.stack, id: msg.id });
		}
	} else if(msg.type === "globalEval") {
		let workers = cluster.onlineWorkers;
		if(worker) {
			waitingOutputs[msg.id] = {
				expected: workers.length,
				results: [],
				callback: results => worker.send({ type: "output", results, id: msg.id })
			};
		}

		workers.forEach(work => {
			work.send({
				type: "eval",
				input: msg.input,
				id: msg.id
			});
		});
	} else if(msg.type === "eval") {
		if(!msg.target) {
			if(worker) worker.send({ type: "output", error: "No target specified", id: msg.id });
			return;
		}
		let workers = cluster.onlineWorkers;
		if(worker) {
			waitingOutputs[msg.id] = {
				expected: 1,
				results: [],
				callback: results => worker.send({ type: "output", result: results[0], id: msg.id })
			};
		}

		let targetWorker, shard;
		if(msg.target[0] === "shard" || msg.target[0] === "guild") {
			if(msg.target[0] === "guild") shard = ~~((msg.guildID / 4194304) % process.shardCount);
			else shard = msg.target[1];
			targetWorker = workers.find(work => shard >= work.shardStart && shard <= work.shardEnd);
		}

		if(!targetWorker) {
			if(worker) worker.send({ type: "output", error: "Target not found", id: msg.id });
			return;
		}

		targetWorker.send({
			type: "eval",
			input: msg.input,
			id: msg.id
		});
	} else if(msg.type === "output") {
		if(!waitingOutputs[msg.id]) return;

		waitingOutputs[msg.id].results.push(msg.error || msg.result);
		if(waitingOutputs[msg.id].expected === waitingOutputs[msg.id].results.length) {
			waitingOutputs[msg.id].callback(waitingOutputs[msg.id].results);
			setTimeout(() => delete waitingOutputs[msg.id], 5000);
		}
	}
};

let shardCount = 1;
async function init() {
	await (require("./utils/rethink.js")).init();
	statsd({ type: "event", stat: "master_started", value: `Master started up` });
	webhook({
		title: `Master started`,
		color: 0x0000FF,
		timestamp: new Date()
	});

	let shardsPerWorker = publicConfig.shardsPerWorker;
	if(~process.argv.indexOf("--shards")) shardCount = parseInt(process.argv[process.argv.indexOf("--shards") + 1]);
	if(shardCount < 1) shardCount = 1;
	process.shardCount = shardCount;
	statsd({ type: "gauge", stat: "shards", value: shardCount });

	const workerCount = Math.ceil(shardCount / shardsPerWorker);
	statsd({ type: "gauge", stat: "workers", value: workerCount });
	for(let i = 0; i < workerCount; i++) {
		let shardStart = i * shardsPerWorker, shardEnd = ((i + 1) * shardsPerWorker) - 1;
		if(shardEnd > shardCount - 1) shardEnd = shardCount - 1;

		const worker = cluster.fork();
		worker.shardStart = shardStart;
		worker.shardEnd = shardEnd;
		handleWorker(worker);
	}
}
init();

process.stdin.resume();
process.on("SIGINT", async () => {
	statsd({ type: "event", stat: "master_exit", value: `Master Exited` });
	await webhook({
		title: `Master Exited`,
		color: 0x0000FF,
		description: `Recieved SIGINT (exit via terminal)`,
		timestamp: new Date()
	});
	process.exit(0);
});
