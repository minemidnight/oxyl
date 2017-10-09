const cluster = require("cluster");

function handleMessage(message) {
	if(message.op !== "startup") {
		cluster.worker.once("message", handleMessage);
		return;
	}

	require(`../${message.type}/index`);
}

cluster.worker.once("message", handleMessage);
