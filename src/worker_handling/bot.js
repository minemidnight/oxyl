const messageHandler = require("../worker_handling/messages.js");
const webhook = require("../misc/webhookStatus");
const workerCrashes = {};

module.exports = async worker => {
	worker.on("online", () => {
		console.startup(`Worker ${worker.id} started (hosting ${worker.shardRange})`);
		worker.send({
			type: "startup",
			shardRange: worker.shardRange,
			shardStart: worker.shardStart,
			shardEnd: worker.shardEnd,
			totalShards: worker.totalShards,
			processType: "bot"
		});

		if(process.uptime() >= 50) {
			webhook({
				title: `Worker ${worker.id} started`,
				color: 0x00FF00,
				description: `Hosting ${worker.shardRange}`,
				timestamp: new Date()
			});
		}
	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			return;
		} else if(code === 0) {
			console.info(`Worker ${worker.id} killed successfully ` +
				`(hosted shards ${worker.shardStart}-${worker.shardEnd}).`);

			webhook({
				title: `Worker ${worker.id} killed`,
				color: 0xFFFF00,
				description: `Exit code: ${code} (success)\nHosted ${worker.shardRange}`,
				timestamp: new Date()
			});
		} else if(workerCrashes[worker.shardRange] >= 2) {
			console.error(`Worker ${worker.id} killed due to restart loop with ` +
					`exit code: ${code} (hosted ${worker.shardRange}).`);

			webhook({
				title: `Worker ${worker.id} killed (restart loop)`,
				color: 0xFF0000,
				description: `Exit code: ${code}\nHosted ${worker.shardRange}`,
				timestamp: new Date()
			});
		} else {
			console.warn(`Worker ${worker.id} died with exit code ${code} ` +
				`(hosted ${worker.shardRange}). Respawning new process...`);
			const newWorker = cluster.fork();
			Object.assign(newWorker, {
				type: "bot",
				shardStart: worker.shardStart,
				shardEnd: worker.shardEnd,
				shardRange: worker.shardRange,
				totalShards: worker.totalShards
			});
			module.exports(newWorker);

			webhook({
				title: `Worker ${worker.id} died`,
				color: 0xFFFF00,
				description: `Exit code: ${code}\nHosted ${worker.shardRange}\n` +
					`Respawned as ${newWorker.id}`,
				timestamp: new Date()
			});

			if(!workerCrashes[worker.shardRange]) workerCrashes[worker.shardRange] = 1;
			else workerCrashes[worker.shardRange]++;
			setTimeout(() => {
				if(workerCrashes[worker.shardRange] === 1) delete workerCrashes[worker.shardRange];
				else workerCrashes[worker.shardRange]--;
			}, 120000);
		}
	});

	worker.on("message", msg => messageHandler(msg, worker));
};
