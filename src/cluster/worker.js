const cluster = require("cluster");
const messageHandler = require("./workerMessages");

function handleMessage(message) {
	if(message.op !== "startup") {
		cluster.worker.once("message", handleMessage);
		return;
	}

	require(`../${message.type}/index`);
	cluster.worker.on("message", messageHandler);
}

cluster.worker.once("message", handleMessage);
