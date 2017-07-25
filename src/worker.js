const path = require("path");
async function startupMessage(msg) {
	if(msg.type !== "startup") {
		cluster.worker.once("message", startupMessage);
		return;
	}

	if(msg.processType === "bot") {
		delete msg.type;
		delete msg.processType;

		Object.assign(cluster.worker, msg);
		require(path.resolve("src", "bot", "index"));
	} else {
		setTimeout(() => require(path.resolve("src", "website", "index")), 120000);
	}
}

cluster.worker.once("message", startupMessage);
