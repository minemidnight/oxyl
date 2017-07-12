async function startupMessage(msg) {
	if(msg.type !== "startup") {
		cluster.worker.once("message", startupMessage);
		return;
	}

	if(msg.processType === "bot") {
		delete msg.type;
		delete msg.processType;

		Object.assign(cluster.worker, msg);
		require("./../bot/index");
	} else {
		require("./../website/index");
	}
}

cluster.worker.once("message", startupMessage);
