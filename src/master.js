global.Promise = require("bluebird");
require("./modules/logger.js");
const webhook = require("./modules/webhookStatus.js");
const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
const workerCrashes = [], waitingEvals = [];

function handleWorker(worker, shardStart, shardEnd) {
	worker.on("online", () => {
		console.startup(`Worker ${worker.id} started (hosting shards ${shardStart}-${shardEnd})`);
		worker.send({ type: "startup", shardStart, shardEnd });

		webhook({
			title: `Worker ${worker.id} started`,
			color: 0x00FF00,
			description: `Hosting shards ${shardStart}-${shardEnd}`,
			timestamp: new Date()
		});
	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			console.startup(`Worker ${worker.id} died with signal ${signal} (hosted shards ${shardStart}-${shardEnd})`);

			webhook({
				title: `Worker ${worker.id} died`,
				color: 0xFF0000,
				description: `Singal: ${signal}\nHosted shards ${shardStart}-${shardEnd}`,
				timestamp: new Date()
			});
		} else if(code !== 0) {
			if(workerCrashes[`${shardStart}-${shardEnd}`] && workerCrashes[`${shardStart}-${shardEnd}`] >= 4) {
				console.startup(`Worker ${worker.id} killed due to restart loop with ` +
					`exit code: ${code} (hosted shards ${shardStart}-${shardEnd}).`);

				webhook({
					title: `Worker ${worker.id} killed (restart loop)`,
					color: 0xFF0000,
					description: `Exit code: ${code}\nHosted shards ${shardStart}-${shardEnd}`,
					timestamp: new Date()
				});
			} else {
				console.startup(`Worker ${worker.id} died with exit code ${code} ` +
					`(hosting shards ${shardStart}-${shardEnd}). Respawning new process...`);
				handleWorker(cluster.fork(), shardStart, shardEnd);

				webhook({
					title: `Worker ${worker.id} died`,
					color: 0xFFFF00,
					description: `Exit code: ${code}\nHosting shards ${shardStart}-${shardEnd}\nRespawning...`,
					timestamp: new Date()
				});

				if(!workerCrashes[`${shardStart}-${shardEnd}`]) workerCrashes[`${shardStart}-${shardEnd}`] = 1;
				else workerCrashes[`${shardStart}-${shardEnd}`]++;
				setTimeout(() => {
					if(!workerCrashes[`${shardStart}-${shardEnd}`]) return;
					if(workerCrashes[`${shardStart}-${shardEnd}`] === 1) delete workerCrashes[`${shardStart}-${shardEnd}`];
					else workerCrashes[`${shardStart}-${shardEnd}`]--;
				}, 20000);
			}
		} else {
			console.startup(`Worker ${worker.id} killed successfully ` +
				`(hosted shards ${shardStart}-${shardEnd}).`);

			webhook({
				title: `Worker ${worker.id} killed`,
				color: 0xFFFF00,
				description: `Exit code: ${code} (success)\nHosted shards ${shardStart}-${shardEnd}`,
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

let waitingOutputs = {};
async function handleMessage(msg, worker) {
	if(msg.type === "masterEval") {
		try {
			let result = eval(msg.input);
			worker.send({ type: "output", result, id: msg.id });
		} catch(err) {
			worker.send({ type: "output", error: err, id: msg.id });
		}
	} else if(msg.type === "globalEval") {
		let workers = getOnlineWorkers();
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
	} else if(msg.type === "output") {
		if(!waitingOutputs[msg.id]) return;

		waitingOutputs[msg.id].results.push(msg.result);
		if(waitingOutputs[msg.id].expected === waitingOutputs[msg.id].results.length) {
			worker.send({ type: "output", results: waitingOutputs[msg.id].results, id: msg.id });
			setTimeout(() => delete waitingOutputs[msg.id], 5000);
		}
	}
}

function init() {
	webhook({
		title: `Master started`,
		color: 0x0000FF,
		timestamp: new Date()
	});

	let shardCount = 1, perCluster = publicConfig.shardsPerWorker;
	if(~process.argv.indexOf("--shards")) shardCount = parseInt(process.argv[process.argv.indexOf("--shards") + 1]);

	let workerCount = Math.ceil(shardCount / perCluster);
	for(let i = 0; i < workerCount; i++) {
		let shardStart = i * perCluster, shardEnd = (i + 1) * 3;
		if(shardEnd > shardCount) shardEnd = shardCount;

		handleWorker(cluster.fork(), shardStart, shardEnd);
	}
}
init();

process.on("unhandledRejection", err => console.error(err.stack));

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
