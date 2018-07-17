const cluster = require("cluster");
const messageHandler = require("./masterMessages");
const workerData = new Map();
const workerCrashes = new Map();

function spawnWorker(data) {
	const worker = cluster.fork();
	data = Object.assign(data, { status: "offline", id: worker.id });
	workerData.set(worker.id, data);

	process.logger.info("cluster", `Spawning worker type ${data.type}`);

	worker.on("message", message => messageHandler(message, worker, workerData, spawnWorker));
	worker.on("exit", async (code, signal) => {
		if(signal) return;

		messageHandler.wsBroadcast({
			op: "workerOffline",
			workerID: worker.id,
			code
		}, workerData);
		if(!code) return;

		process.logger.error("cluster", `Worker ${worker.id} crashed`);
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
			process.logger.startup("worker", `Worker ${worker.id} has started`);

			messageHandler.wsBroadcast({
				op: "workerOnline",
				type: data.type,
				workerID: worker.id,
				status: "online",
				startTime: Date.now()
			}, workerData);

			data = workerData.get(worker.id);
			data.status = "online";
			data.startTime = Date.now();
			worker.send(Object.assign({}, data, { op: "startup" }));
			resolve(worker);
		});
	});
}

async function init() {
	const r = await require("../rethinkdb/index");
	process.logger = require("../logger/index")(r);

	setInterval(async () => {
		const memory = {};

		for(const worker of Object.values(cluster.workers)) {
			memory[worker.id] = await process.output({
				op: "eval",
				target: "worker",
				targetValue: worker.id,
				input: `return process.memoryUsage().heapUsed`
			}, workerData);

			r.table("stats").insert({
				type: "memory",
				current: [process.pid, worker.id],
				time: Date.now(),
				value: memory[worker.id]
			}).run();
		}

		messageHandler.wsBroadcast({
			op: "memoryUsage",
			memory
		}, workerData);
	}, 60000);

	await spawnWorker({ type: "ws" });
	await spawnWorker({ type: "panel" });
	await spawnWorker({ type: "feeds" });
	await spawnWorker({ type: "site" });
	await spawnWorker({ type: "oxylscript/editor" });
	await process.output({ op: "startBot" }, workerData, spawnWorker);
}
init();

process.evalContext = { workerData, workerCrashes };
