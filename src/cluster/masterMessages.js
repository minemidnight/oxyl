const cluster = require("cluster");
const config = require("../../config");
const os = require("os");
const superagent = require("superagent");
const waitingOutputs = new Map();

module.exports = async (message, sentFrom, workerData, spawnWorker) => {
	const reply = data => {
		data.id = message.id;
		if(!sentFrom) module.exports(data, undefined, workerData);
		else sentFrom.send(data);
	};

	switch(message.op) {
		case "eval": {
			if(!message.target) {
				reply({ op: "result", error: true, message: "No target" });
				return;
			}

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

				case "editor": {
					const editor = Object.values(cluster.workers)
						.find(work => work.isConnected() && workerData.get(work.id).type === "oxylscript/editor");
					if(!editor) reply({ op: "result", error: true, message: "No editor worker found" });
					else reply(await process.output(message, editor));

					break;
				}

				case "shard": {
					const targetWorker = Object.values(cluster.workers)
						.find(work => work.isConnected() &&
							workerData.get(work.id).type === "bot" &&
							message.targetValue >= workerData.get(work.id).shardStart &&
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
							const results = await Promise.all(botWorkers.map(work => process.output({
								op: "eval",
								target: "worker",
								targetValue: work.id,
								input: message.input
							}, workerData)));

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

		case "startBot": {
			const { body: { shards: shardCount } } = await superagent.get("https://discordapp.com/api/gateway/bot")
				.set("Authorization", config.token);

			const coreCount = os.cpus().length;
			const shardsPerWorker = Math.ceil(shardCount / coreCount);
			const workerCount = Math.ceil(shardCount / shardsPerWorker);
			for(let i = 0; i < workerCount; i++) {
				const shardStart = i * shardsPerWorker;
				let shardEnd = ((i + 1) * shardsPerWorker) - 1;
				if(shardEnd > shardCount - 1) shardEnd = shardCount - 1;

				const shards = shardStart === shardEnd ? `shard ${shardStart}` : `shards ${shardStart}-${shardEnd}`;
				spawnWorker({ type: "bot", shardStart, shardEnd, shardCount, shards });
			}

			break;
		}

		case "restartBotHard": {
			process.logger.info("bot", "Hard restarting all bot workers");

			const botWorkers = Object.values(cluster.workers)
				.filter(work => work.isConnected() && workerData.get(work.id).type === "bot");

			for(const worker of botWorkers) {
				await process.output({
					op: "eval",
					target: "worker",
					targetValue: worker.id,
					input: `process.exit(1)`
				}, workerData);
			}

			break;
		}

		case "restartBotRolling": {
			const botWorkers = Object.values(cluster.workers)
				.filter(work => work.isConnected() && workerData.get(work.id).type === "bot");

			process.logger.info("bot", "Rolling restart to all bot workers");
			for(const worker of botWorkers) {
				let resolveWorker;
				const waitReady = new Promise(resolve => resolveWorker = resolve);

				worker.once("disconnect", async () => {
					const newWorker = await new Promise(resolve => {
						process.nextTick(() => {
							const keys = Object.keys(cluster.workers);
							resolve(cluster.workers[keys.length - 1]);
						});
					});

					const tryResolve = () => {
						const data = workerData.get(newWorker.id);
						if(data && data.status === "ready") resolveWorker();
						else process.nextTick(tryResolve);
					};

					process.nextTick(tryResolve);
				});

				worker.disconnect();

				await waitReady;
			}

			break;
		}

		case "ready": {
			process.logger.startup("worker", `Worker ${sentFrom.id} (${workerData.get(sentFrom.id).type}) is ready`);
			workerData.get(sentFrom.id).status = "ready";

			break;
		}
	}
};

require("./processOutput")(waitingOutputs, "master");
