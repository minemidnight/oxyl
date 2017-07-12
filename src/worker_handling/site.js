const messageHandler = require("../worker_handling/messages.js");
const webhook = require("../misc/webhookStatus");
let crashes = 0;

module.exports = async worker => {
	worker.on("online", () => {
		worker.send({ type: "startup", processType: "site" });
		if(process.uptime() >= 50) {
			webhook({
				title: `Worker ${worker.id} started`,
				color: 0x00FF00,
				description: `Hosting website`,
				timestamp: new Date()
			});
		}
	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			return;
		} else if(code === 0) {
			console.info(`Worker ${worker.id} killed successfully (website).`);

			webhook({
				title: `Worker ${worker.id} killed`,
				color: 0xFFFF00,
				description: `Exit code: ${code} (success)\nHosted website`,
				timestamp: new Date()
			});
		} else if(crashes >= 3) {
			console.error(`Worker ${worker.id} killed due to restart loop with ` +
					`exit code: ${code} (hosted website).`);

			webhook({
				title: `Worker ${worker.id} killed (restart loop)`,
				color: 0xFF0000,
				description: `Exit code: ${code}\nHosted ${worker.shardRange}`,
				timestamp: new Date()
			});
		} else {
			console.warn(`Worker ${worker.id} died with exit code ${code} ` +
				`(hosted website). Respawning new process...`);
			const newWorker = cluster.fork();
			Object.assign(newWorker, { type: "website" });
			module.exports(newWorker);

			webhook({
				title: `Worker ${worker.id} died`,
				color: 0xFFFF00,
				description: `Exit code: ${code}\nHosted website\nRespawned as ${newWorker.id}`,
				timestamp: new Date()
			});

			crashes++;
			setTimeout(() => crashes--, 120000);
		}
	});

	worker.on("message", msg => messageHandler(msg, worker));
};
