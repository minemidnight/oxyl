const webhook = require("./modules/webhookStatus.js");
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

		webhook({
			title: `Worker ${worker.id} started`,
			color: 0x00FF00,
			description: `Hosting shards ${worker.shardStart}-${worker.shardEnd}`,
			timestamp: new Date()
		});
	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			return;
			// 	console.error(`Worker ${worker.id} died with signal ${signal} ` +
			// 		`(hosted shards ${worker.shardStart}-${worker.shardEnd})`);
			//
			// 	webhook({
			// 		title: `Worker ${worker.id} died`,
			// 		color: 0xFF0000,
			// 		description: `Singal: ${signal}\nHosted shards ${worker.shardStart}-${worker.shardEnd}`,
			// 		timestamp: new Date()
			// 	});
		} else if(code !== 0) {
			if(workerCrashes[worker.id] && workerCrashes[worker.id] >= 4) {
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

				if(!workerCrashes[worker.id]) workerCrashes[worker.id] = 1;
				else workerCrashes[worker.id]++;
				setTimeout(() => {
					if(!workerCrashes[worker.id]) return;
					if(workerCrashes[worker.id] === 1) delete workerCrashes[worker.id];
					else workerCrashes[worker.id]--;
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

	worker.on("message", msg => handleMessage(msg, worker));
}

function getOnlineWorkers() {
	return Object.keys(cluster.workers)
		.map(id => cluster.workers[id])
		.filter(work => work.isConnected());
}

const waitingOutputs = {};
async function handleMessage(msg, worker) {
	if(msg.type === "masterEval") {
		try {
			const result = await eval(msg.input);
			worker.send({ type: "output", result, id: msg.id });
		} catch(err) {
			worker.send({ type: "output", error: err.stack, id: msg.id });
		}
	} else if(msg.type === "globalEval") {
		const workers = getOnlineWorkers();
		waitingOutputs[msg.id] = {
			expected: workers.length,
			results: []
		};

		workers.forEach(work => {
			work.send({
				type: "eval",
				input: msg.input,
				id: msg.id
			});
		});
	} else if(msg.type === "eval") {
		if(!msg.target) {
			worker.send({ type: "output", error: "No target specified", id: msg.id });
			return;
		}
		const workers = getOnlineWorkers();
		waitingOutputs[msg.id] = {
			expected: 1,
			results: []
		};

		let targetWorker;
		if(msg.target[0] === "shard") {
			const shard = msg.target[1];
			targetWorker = workers.find(work => work.shardStart >= shard && work.shardEnd <= shard);
		}

		if(!targetWorker) {
			worker.send({ type: "output", error: "Target not found", id: msg.id });
			return;
		}

		targetWorker.send({
			type: "eval",
			input: msg.input,
			id: msg.id
		});
	} else if(msg.type === "output") {
		if(!waitingOutputs[msg.id]) return;

		waitingOutputs[msg.id].results.push(msg.result || msg.error);
		if(waitingOutputs[msg.id].expected === waitingOutputs[msg.id].results.length) {
			worker.send({ type: "output", results: waitingOutputs[msg.id].results, id: msg.id });
			setTimeout(() => delete waitingOutputs[msg.id], 5000);
		}
	}
}

let shardCount = 1;
function init() {
	webhook({
		title: `Master started`,
		color: 0x0000FF,
		timestamp: new Date()
	});

	let perCluster = publicConfig.shardsPerWorker;
	if(~process.argv.indexOf("--shards")) shardCount = parseInt(process.argv[process.argv.indexOf("--shards") + 1]);
	if(shardCount < 1) shardCount = 1;
	statsd({ type: "gauge", stat: "shards", value: shardCount });

	const workerCount = Math.ceil(shardCount / perCluster);
	statsd({ type: "gauge", stat: "workers", value: workerCount });
	for(let i = 0; i < workerCount; i++) {
		let shardStart = i * perCluster, shardEnd = ((i + 1) * 3) - 1;
		if(shardEnd > shardCount) shardEnd = shardCount - 1;

		const worker = cluster.fork();
		worker.shardStart = shardStart;
		worker.shardEnd = shardEnd;
		handleWorker(worker);
	}
}
init();

process.stdin.resume();
process.on("SIGINT", async () => {
	await webhook({
		title: `Master Exited`,
		color: 0x0000FF,
		description: `Recieved SIGINT (exit via terminal)`,
		timestamp: new Date()
	});
	process.exit(0);
});
