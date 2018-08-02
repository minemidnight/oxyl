const cluster = require("cluster");
let messageHandler = require("./workerMessages");
const path = require("path");

async function handleMessage(message) {
	if(message.op !== "startup") {
		cluster.worker.once("message", handleMessage);
		return;
	}

	cluster.worker.type = message.type;
	const context = require(path.resolve(__dirname, "..", message.type, "index.js"));
	if(typeof context === "function") await context(message);

	if(context.extraHandlers) {
		messageHandler = messageHandler(context.extraHandlers);
		delete context.extraHandlers;
	} else {
		messageHandler = messageHandler();
	}


	process.evalContext = typeof context === "function" ? await context(message) : context;


	cluster.worker.on("message", messageHandler);
}

cluster.worker.once("message", handleMessage);
