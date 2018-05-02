const config = require("../../config");
const messageHandler = require("./messageHandler");
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: config.websocketPort });

let heartbeatData = {};
server.on("connection", client => {
	client.authenicated = false;
	client.sendJSON = json => client.send(JSON.stringify(json));
	client.sendHeartbeat = () => {
		client.alive = false;
		client.sendJSON(heartbeatData);
	};

	client.on("message", message => messageHandler(client, message));
});

server.broadcast = data => server.clients.forEach(client => {
	if(client.readyState !== WebSocket.OPEN) return;
	else client.send(JSON.stringify(data));
});

server.on("error", err => server.broadcast({ op: "log", message: err.stack }));

async function updateHeartbeat() {
	const data = await process.output({
		op: "eval",
		target: "master",
		input: `return Array.from(context.workerData.values())`
	});

	heartbeatData = { op: "heartbeat", workers: data };
	return heartbeatData;
}

updateHeartbeat();
setInterval(async () => {
	await updateHeartbeat();

	server.clients
		.forEach(client => {
			if(client.readyState !== WebSocket.OPEN) return;
			else if(!client.alive) client.terminate();
			else client.sendHeartbeat();
		});
}, 30000);

process.output({ op: "ready" });
module.exports = { server };
