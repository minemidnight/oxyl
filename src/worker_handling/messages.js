const waitingResults = {};
module.exports = async (msg, worker) => {
	if(msg.type === "master") {
		try {
			let result = await eval(msg.input);
			worker.send({ type: "output", result, id: msg.id });
		} catch(err) {
			worker.send({ type: "output", error: err.stack, id: msg.id });
		}
	} else if(msg.type === "site") {
		let targetWorker = cluster.onlineWorkers.find(work => work.type === "site");
		if(!targetWorker) {
			worker.send({ type: "output", error: "No website worker", id: msg.id });
		} else {
			waitingResults[msg.id] = {
				expected: 1,
				results: [],
				worker
			};
			targetWorker.send({ type: "eval", input: msg.input, id: msg.id });
		}
	} else if(msg.type === "shard") {
		let targetShard = msg.target;
		if(!targetShard) {
			worker.send({ type: "output", error: "Invalid target", id: msg.id });
		} else {
			let targetWorker = cluster.onlineWorkers.find(work => work.type === "bot" &&
				targetShard >= work.shardStart &&
				targetShard <= work.shardEnd);

			if(!targetWorker) {
				worker.send({ type: "output", error: "Invalid target (not found)", id: msg.id });
			} else {
				waitingResults[msg.id] = {
					expected: 1,
					results: [],
					worker
				};
				targetWorker.send({ type: "eval", input: msg.input, id: msg.id });
			}
		}
	} else if(msg.type === "guild") {
		if(!msg.target) {
			worker.send({ type: "output", error: "Invalid target", id: msg.id });
		} else {
			let targetShard = ~~((msg.target / 4194304) % process.totalShards);
			let targetWorker = cluster.onlineWorkers.find(work => work.type === "bot" &&
				targetShard >= work.shardStart &&
				targetShard <= work.shardEnd);

			if(!targetWorker) {
				worker.send({ type: "output", error: "Invalid target (not found)", id: msg.id });
			} else {
				waitingResults[msg.id] = {
					expected: 1,
					results: [],
					worker
				};
				targetWorker.send({ type: "eval", input: msg.input, id: msg.id });
			}
		}
	} else if(msg.type === "all_shards") {
		let workers = cluster.onlineWorkers.filter(work => work.type === "bot");
		waitingResults[msg.id] = {
			alwaysPlural: true,
			expected: workers.length,
			results: [],
			worker
		};
		workers.forEach(work => work.send({ type: "eval", input: msg.input, id: msg.id }));
	} else if(msg.type === "output") {
		if(!waitingResults[msg.id]) return;
		let waiting = waitingResults[msg.id];

		if(msg.error) {
			waiting.worker.send({ type: "output", error: msg.error, id: msg.id });
			delete waitingResults[msg.id];
			return;
		}

		waiting.results.push(msg.result);
		if(waiting.results.length === waiting.expected) {
			if(waiting.expected > 1 || waiting.alwaysPlural) {
				waiting.worker.send({ type: "output", results: waiting.results, id: msg.id });
			} else {
				waiting.worker.send({ type: "output", result: waiting.results[0], id: msg.id });
			}

			delete waitingResults[msg.id];
		}
	}
};
