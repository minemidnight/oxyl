const cluster = require("cluster");
const messageHandler = require("./masterMessages");
const workerData = new Map();
const workerCrashes = new Map();

function spawnWorker(data) {
	const worker = cluster.fork();
	data = Object.assign(data, { status: "offline", id: worker.id });
	workerData.set(worker.id, data);

	worker.on("message", message => messageHandler(message, worker, workerData, spawnWorker));
	worker.on("exit", async (code, signal) => {
		if(signal) return;

		if(process.uptime() >= 10) {
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

		const newWorker = await spawnWorker(data);
		workerCrashes.set(newWorker.id, crashes);

		await new Promise(resolve => setTimeout(resolve, 30000));
		const count = workerCrashes.get(newWorker.id) - 1;
		if(!count) workerCrashes.delete(newWorker.id);
		else workerCrashes.set(newWorker.id, count);
	});

	return new Promise(resolve => {
		worker.once("online", () => {
			if(process.uptime() >= 10) {
				process.output({
					op: "eval",
					target: "ws",
					input: `context.server.broadcast({ op: "workerOnline", type: "${data.type}", id: ${worker.id}, ` +
					`status: "online", startTime: ${Date.now()} })`
				}, workerData);
			}

			data = workerData.get(worker.id);
			data.status = "online";
			data.startTime = Date.now();
			worker.send(Object.assign({}, data, { op: "startup" }));
			resolve(worker);
		});
	});
}

async function init() {
	await require("../rethinkdb/index");
	await spawnWorker({ type: "ws" });
	await spawnWorker({ type: "panel" });
	await spawnWorker({ type: "feeds" });
}
init();

process.evalContext = { workerData, workerCrashes };
