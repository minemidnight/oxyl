const config = require("../../config");
const messageHandler = require("./messageHandler");
const r = require("../rethinkdb/index");
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: config.websocketPort });

process.logger = require("../logger/index")(r);

let Redis;
if(process.env.NODE_ENV === "development") Redis = require("ioredis-mock");
else Redis = require("ioredis");
const redis = new Redis({ db: config.redisDB });

const getMessage = {
	workerOffline({ workerID, code }) { return `Worker ${workerID} died, code ${code}`; },
	workerOnline({ workerID, type }) { return `Worker ${workerID} online, type ${type}`; },
	workerReady({ workerID }) {	return `Worker ${workerID} ready`; },
	log({ message }) { return message; }
};

async function addLogs(data) {
	if(!getMessage[data.op]) return;

	const id = (process.hrtime().reduce((a, b) => a + b) + Date.now()).toString(36);
	redis.set(`logs::${id}`, getMessage[data.op](data), "EX", 1209600);
}

server.redis = redis;
server.on("connection", client => {
	client.authenicated = false;
	client.server = server;
	client._send = client.send;
	client.send = (json, isBroadcast = false) => {
		if(!isBroadcast) addLogs(json);
		client._send(JSON.stringify(json));
	};

	client.heartbeat = () => {
		client.alive = false;
		client.send(server.heartbeatData);
	};

	client.on("message", message => messageHandler(client, message));
});

server.broadcast = data => {
	addLogs(data);

	server.clients.forEach(client => {
		if(client.readyState !== WebSocket.OPEN) return;
		else client.send(data, true);
	});
};

server.on("error", err => server.broadcast({ op: "log", message: err.stack }));

async function updateHeartbeat() {
	const data = await process.output({
		op: "eval",
		target: "master",
		input: `return Array.from(context.workerData.values())`
	});

	server.heartbeatData = {
		op: "heartbeat",
		workers: data
	};
}

updateHeartbeat();
setInterval(async () => {
	await updateHeartbeat();

	server.clients
		.forEach(client => {
			if(client.readyState !== WebSocket.OPEN) return;
			else if(!client.alive) client.terminate();
			else if(client.authenicated) client.heartbeat();
		});
}, 30000);

process.output({ op: "ready" });
module.exports = { server };
