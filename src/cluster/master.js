const cluster = require("cluster");
const messageHandler = require("./messages");
const workerData = new Map();
const workerCrashes = new Map();

function spawnWorker(type) {
	const worker = cluster.fork();
	workerData.set(worker.id, { type });

	worker.on("message", message => messageHandler(message, worker));
	worker.on("exit", async (code, signal) => {
		if(signal || !code) return;

		workerData.delete(worker.id);
		const crashes = (workerCrashes.get(worker.id) || 0) + 1;
		workerCrashes.delete(worker.id);
		if(crashes >= 3) return;

		const newWorker = await spawnWorker(type);
		workerCrashes.set(newWorker.id, crashes);

		await new Promise(resolve => setTimeout(resolve, 30000));
		const count = workerCrashes.get(newWorker.id) - 1;
		if(!count) workerCrashes.delete(newWorker.id);
		else workerCrashes.set(newWorker.id, count);
	});

	return new Promise(resolve => {
		worker.once("online", () => {
			worker.send({ op: "startup", type });
			resolve(worker);
		});
	});
}

async function init() {
	await require("../rethinkdb/index");
	await spawnWorker("ws");
	await spawnWorker("panel");
}
init();
