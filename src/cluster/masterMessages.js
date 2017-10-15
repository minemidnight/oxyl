const cluster = require("cluster");
const waitingOutputs = new Map();

module.exports = async (message, sentFrom, workerData) => {
	const reply = data => {
		if(!sentFrom) module.exports(data, undefined, workerData);
		else sentFrom.send(Object.assign(data, { id: message.id }));
	};

	switch(message.op) {
		case "eval": {
			if(!message.target) reply({ op: "result", error: true, message: "No target" });
			const { target } = message;
			switch(target) {
				case "master": {
					const { input } = message;

					try {
						const context = process.evalContext; // eslint-disable-line no-unused-vars
						const result = await eval(input);
						reply({ op: "result", error: false, result });
					} catch(err) {
						reply({ op: "result", error: true, message: err.message });
					}

					break;
				}

				case "panel": {
					const panel = Object.values(cluster.workers)
						.find(work => work.isConnected() && workerData.get(work.id).type === "panel");
					if(!panel) reply({ op: "result", error: true, message: "No panel worker found" });
					else reply(await process.output(message, panel));

					break;
				}

				case "ws": {
					const ws = Object.values(cluster.workers)
						.find(work => work.isConnected() && workerData.get(work.id).type === "ws");
					if(!ws) reply({ op: "result", error: true, message: "No websocket worker found" });
					else reply(await process.output(message, ws));

					break;
				}

				case "site": {
					const site = Object.values(cluster.workers)
						.find(work => work.isConnected() && workerData.get(work.id).type === "site");
					if(!site) reply({ op: "result", error: true, message: "No site worker found" });
					else reply(await process.output(message, site));

					break;
				}

				case "shard": {
					const targetWorker = Object.values(cluster.workers)
						.find(work => work.isConnected() &&
							workerData.get(work.id).type === "bot" &&
							message.targetValue >= workerData.get(work.id).shardShard &&
							message.targetValue <= workerData.get(work.id).shardEnd);

					if(!targetWorker) reply({ op: "result", error: true, message: "No worker found with shard" });
					else reply(await process.output(message, targetWorker));

					break;
				}

				case "guild": {
					const targetWorker = Object.values(cluster.workers)
						.find(work => {
							if(!work.isConnected() || workerData.get(work.id).type !== "bot") return false;

							const data = workerData.get(work.id);
							const targetShard = ~~(message.targetValue / 4194304) % data.shardCount;
							return targetShard >= data.shardStart && targetShard <= data.shardEnd;
						});

					if(!targetWorker) reply({ op: "result", error: true, message: "No worker found with shard" });
					else reply(await process.output(message, targetWorker));

					break;
				}

				case "allBots": {
					const botWorkers = Object.values(cluster.workers)
						.filter(work => work.isConnected() && workerData.get(work.id).type === "bot");

					if(!botWorkers.length) {
						reply({ op: "result", error: true, message: "No bot workers started" });
					} else {
						try {
							const results = await Promise.all(...botWorkers.map(work => process.output(message, work)));
							reply({ op: "result", error: false, results: results.map(({ result }) => result) });
						} catch(err) {
							reply({ op: "result", error: true, message: err.message });
						}
					}

					break;
				}

				case "worker": {
					const targetWorker = Object.values(cluster.workers)
						.find(work => work.isConnected() && work.id === message.targetValue);

					if(!targetWorker) reply({ op: "result", error: true, message: "No worker found with id" });
					else reply(await process.output(message, targetWorker));

					break;
				}
			}

			break;
		}

		case "result": {
			if(!waitingOutputs.has(message.id)) return;
			waitingOutputs.get(message.id)(message);

			break;
		}

		case "ready": {
			workerData.get(sentFrom.id).status = "ready";
			if(process.uptime() >= 20) {
				process.output({
					op: "eval",
					target: "ws",
					input: `context.server.broadcast({ op: "workerReady", workerID: ${sentFrom.id} })`
				}, workerData);
			}

			break;
		}
	}
};

require("./processOutput")(waitingOutputs, "master");
