const cluster = require("cluster");
const messageHandler = require("./masterMessages");
const workerData = new Map();
const workerCrashes = new Map();

function spawnWorker(type) {
	const worker = cluster.fork();
	workerData.set(worker.id, { type, status: "offline", id: worker.id });

	worker.on("message", message => messageHandler(message, worker, workerData));
	worker.on("exit", async (code, signal) => {
		if(signal) return;

		if(process.uptime() >= 20) {
			process.output({
				op: "eval",
				target: "ws",
				input: `context.server.broadcast({ op: "workerOffline", workerID: ${worker.id}, code: ${code} })`
			}, workerData);
		}
		if(!code) return;

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
			if(process.uptime() >= 20) {
				process.output({
					op: "eval",
					target: "ws",
					input: `context.server.broadcast({ op: "workerOnline", type: "${type}", id: ${worker.id}, ` +
					`status: "online", startTime: ${Date.now()} })`
				}, workerData);
			}

			workerData.get(worker.id).status = "online";
			workerData.get(worker.id).startTime = Date.now();
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

process.evalContext = { workerData, workerCrashes };
