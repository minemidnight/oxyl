const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
const workerCrashes = [];
function handleWorker(worker, shardStart, shardEnd) {
	worker.on("online", () => {
		console.log(`Worker ${worker.id} started (hosting shards ${shardStart}-${shardEnd})`);
		worker.send({ type: "startup", shardStart, shardEnd });
	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			console.log(`Worker ${worker.id} killed with signal ${signal} (hosted shards ${shardStart}-${shardEnd})`);
		} else if(code !== 0) {
			if(workerCrashes[`${shardStart}-${shardEnd}`] && workerCrashes[`${shardStart}-${shardEnd}`] >= 4) {
				console.log(`Worker ${worker.id} terminated due to restart loop with ` +
					`exit code: ${code} (hosted shards ${shardStart}-${shardEnd}).`);
			} else {
				console.log(`Worker ${worker.id} killed with code ${code} ` +
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
			console.log(`Worker ${worker.id} killed successfully ` +
				`(hosted shards ${shardStart}-${shardEnd}).`);
		}
	});
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
