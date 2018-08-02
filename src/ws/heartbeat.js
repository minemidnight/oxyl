const heartbeatFormat = require("./format/heartbeat");

module.exports.interval = server => setInterval(async () => {
	server.clients.forEach(client => client.heartbeat());
}, 30000);

module.exports.send = client => {
	if(client.alive === false) {
		client.terminate();
		return;
	}

	client.alive = false;
	client.send(heartbeatFormat());
};
