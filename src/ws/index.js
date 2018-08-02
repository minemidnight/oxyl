const config = require("../../config");
const handler = require("./handler");
const heartbeat = require("./heartbeat");
const r = require("../rethinkdb/index");
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: config.websocketPort });

process.logger = require("../logger/index")(r);

let Redis;
if(process.env.NODE_ENV === "development") Redis = require("ioredis-mock");
else Redis = require("ioredis");
const redis = new Redis({ db: config.redisDB });

server.redis = redis;
server.on("connection", client => {
	client.authorized = false;
	client.alive = true;
	client.heartbeat = () => heartbeat.send(client);

	client.server = server;
	client._send = client.send;
	client.send = json => client._send(JSON.stringify(json));

	client.on("message", message => handler(client, message));
});

server.broadcast = data => {
	server.clients.forEach(client => {
		if(client.readyState !== WebSocket.OPEN) return;
		else client.send(data, true);
	});
};

heartbeat.interval(server);

process.output({ op: "ready" });
module.exports = {
	server,
	extraHandlers: {
		memoryUsage({ memory }) {
			server.broadcast({
				op: "memoryUsage",
				memory
			});
		},
		botData({ botData }) {
			server.broadcast({
				op: "botData",
				botData
			});
		}
	}
};
