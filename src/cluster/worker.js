const cluster = require("cluster");
const messageHandler = require("./workerMessages");

async function handleMessage(message) {
	if(message.op !== "startup") {
		cluster.worker.once("message", handleMessage);
		return;
	}

	const context = require(`../${message.type}/index`);
	process.evalContext = typeof context === "function" ? await context(message) : context;
	cluster.worker.on("message", messageHandler);
}

cluster.worker.once("message", handleMessage);
