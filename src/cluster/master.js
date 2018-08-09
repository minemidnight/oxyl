const cluster = require("cluster");
const messageHandler = require("./masterMessages");
const workerData = new Map();
const workerCrashes = new Map();

function spawnWorker(data) {
	const worker = cluster.fork();
	data = Object.assign(data, { status: "offline", id: worker.id });
	workerData.set(worker.id, data);

	process.logger.info("cluster", `Spawning worker ${worker.id}, type ${data.type}`);

	worker.on("message", message => messageHandler(message, worker, workerData, spawnWorker));
	worker.on("exit", async (code, signal) => {
		process.output({
			op: "workerOffline",
			worker: workerData.get(worker.id)
		}, Object.values(cluster.workers)
			.find(work => work.isConnected() && workerData.get(work.id).type === "ws"));
		process.logger.error("cluster", `Worker ${worker.id} crashed, exit code ${code}`);


		workerData.delete(worker.id);

		if(signal || !code) return;
		const crashes = (workerCrashes.get(worker.id) || 0) + 1;
		workerCrashes.delete(worker.id);
		if(crashes >= 3) return;

		const newWorker = await spawnWorker(data);
		workerCrashes.set(newWorker.id, crashes);

		await new Promise(resolve => setTimeout(resolve, 30000));
		const count = workerCrashes.get(newWorker.id) - 1;
		if(!count) workerCrashes.delete(newWorker.id);
		else workerCrashes.set(newWorker.id, count);

		worker.removeAllListeners();
	});

	return new Promise(resolve => {
		worker.once("online", () => {
			process.logger.startup("worker", `Worker ${worker.id} has started`);
			if(Object.values(cluster.workers).find(work => work.isConnected() && workerData.get(work.id).type === "ws")) {
				process.output({
					op: "workerOnline",
					worker: workerData.get(worker.id)
				}, Object.values(cluster.workers)
					.find(work => work.isConnected() && workerData.get(work.id).type === "ws"));
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
	const r = await require("../rethinkdb/index");
	process.logger = require("../logger/index")(r);

	setInterval(async () => {
		const memoryUsage = {};
		const botData = {};

		for(const worker of Object.values(cluster.workers)) {
			const { result: heapUsed } = await process.output({
				op: "eval",
				target: "worker",
				targetValue: worker.id,
				input: `return process.memoryUsage().heapUsed`
			}, workerData);

			workerData.get(worker.id).memoryUsage = heapUsed;
			r.table("workerStats").insert({
				type: "memory",
				ppid: process.pid,
				workerID: worker.id,
				time: Date.now(),
				value: heapUsed
			}).run();

			memoryUsage[worker.id] = heapUsed;

			if(workerData.get(worker.id).type === "bot") {
				const { result } = await process.output({
					op: "eval",
					target: "worker",
					targetValue: worker.id,
					input: () => {
						const messages = context.client.locals.messageCounter / 60; // eslint-disable-line no-undef
						context.client.locals.messageCounter = 0; // eslint-disable-line no-undef

						return {
							guilds: context.client.erisClient.guilds.size, // eslint-disable-line no-undef
							streams: context.client.erisClient.voiceConnections // eslint-disable-line no-undef
								.filter(connection => connection.playing).length,
							users: context.client.erisClient.users.size, // eslint-disable-line no-undef
							messages
						};
					}
				}, workerData);

				Object.assign(workerData.get(worker.id), result);
				botData[worker.id] = result;
			}
		}

		const totals = Object.assign(
			{ memoryUsage: Object.values(memoryUsage).reduce((a, b) => a + b, 0) },
			Object.values(botData).reduce((a, stats) => {
				Object.entries(stats).forEach(([key, value]) => a[key] = (a[key] || 0) + value);

				return a;
			}, {})
		);

		await r.table("globalStats")
			.insert(Object.entries(totals).map(([key, value]) => ({
				type: key,
				time: Date.now(),
				value
			})))
			.run();

		process.output({
			op: "memoryUsage",
			memoryUsage
		}, Object.values(cluster.workers)
			.find(work => work.isConnected() && workerData.get(work.id).type === "ws"));

		process.output({
			op: "botData",
			botData
		}, Object.values(cluster.workers)
			.find(work => work.isConnected() && workerData.get(work.id).type === "ws"));
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
