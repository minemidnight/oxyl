const cluster = require("cluster");
const messageHandler = require("./workerMessages");
const path = require("path");

async function handleMessage(message) {
	if(message.op !== "startup") {
		cluster.worker.once("message", handleMessage);
		return;
	}

	cluster.worker.type = message.type;
	const context = require(path.resolve(__dirname, "..", message.type, "index.js"));
	process.evalContext = typeof context === "function" ? await context(message) : context;
	cluster.worker.on("message", messageHandler);
}

cluster.worker.once("message", handleMessage);
