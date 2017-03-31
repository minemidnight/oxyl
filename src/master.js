const config = JSON.parse(require("fs").readFileSync("public-config.json").toString());

function handleWorker(worker, shardStart, shardEnd) {
	worker.on("online", () => {
		console.log(`Worker ${worker.id} started (hosting shards ${shardStart}-${shardEnd})`);
		worker.message({ type: "startup", shardStart, shardEnd });
	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			console.log(`Worker ${worker.id} killed with signal ${signal} (hosting shards ${shardStart}-${shardEnd})`);
		} else if(code !== 0) {
			console.log(`Worker ${worker.id} killed with code ${code}` +
				`(hosting shards ${shardStart}-${shardEnd}). Respawning new process...`);
			handleWorker(cluster.fork(), shardStart, shardEnd);
		} else {
			console.log(`Worker ${worker.id} killed successfully. Not respawning.` +
				`(hosted shards ${shardStart}-${shardEnd}).`);
		}
	});
}

function init() {
	let shardCount, perCluster = config.shardsPerCluster;
	if(process.env.shardcount) shardCount = parseInt(process.env.shardcount);
	else shardCount = 1;

	let workerCount = Math.ceil(shardCount / perCluster);
	for(let i = 0; i < workerCount; i++) {
		let shardStart = i * perCluster, shardEnd = (i + 1) * 3;
		if(shardEnd > shardCount) shardEnd = shardCount;

		handleWorker(cluster.fork());
	}
}
