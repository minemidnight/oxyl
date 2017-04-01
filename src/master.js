global.Promise = require("bluebird");
require("./utils/logger.js");
const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
const workerCrashes = [], waitingEvals = [];

function handleWorker(worker, shardStart, shardEnd) {
	worker.on("online", () => {
		console.startup(`Worker ${worker.id} started (hosting shards ${shardStart}-${shardEnd})`);
		worker.send({ type: "startup", shardStart, shardEnd });
	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			console.startup(`Worker ${worker.id} killed with signal ${signal} (hosted shards ${shardStart}-${shardEnd})`);
		} else if(code !== 0) {
			if(workerCrashes[`${shardStart}-${shardEnd}`] && workerCrashes[`${shardStart}-${shardEnd}`] >= 4) {
				console.startup(`Worker ${worker.id} terminated due to restart loop with ` +
					`exit code: ${code} (hosted shards ${shardStart}-${shardEnd}).`);
			} else {
				console.startup(`Worker ${worker.id} killed with code ${code} ` +
					`(hosting shards ${shardStart}-${shardEnd}). Respawning new process...`);
				handleWorker(cluster.fork(), shardStart, shardEnd);

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
