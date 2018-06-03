module.exports = (waitingOutputs, type) => {
	process.output = (message, target, spawnWorker) => {
		if(!message.id) {
			const id = (process.hrtime().reduce((a, b) => a + b) + Date.now()).toString(36);
			message.id = id;

			if(message.op === "eval") {
				if(typeof message.input === "function") {
					message.input = `(${message.input.toString().replace(/\\(t|r|n)/gi, "")}).call()`;
				} else if(typeof message.input === "string" && !message.input.endsWith(".call()")) {
					message.input = `(async function(){${message.input}}).call()`;
				}
			}
		}

		if(type === "worker") process.send(message);
		else if(!(target instanceof Map)) target.send(message);
		else require("./masterMessages")(message, undefined, target, spawnWorker);

		return new Promise((resolve, reject) => {
			waitingOutputs.set(message.id, result => {
				if(result.error) {
					if(type === "worker") reject(result.message ? new Error(result.message) : result);
					else resolve(result);
				} else if(type === "worker") {
					resolve(result.results || result.result || result);
				} else {
					resolve(result);
				}
			});
		});
	};
};
