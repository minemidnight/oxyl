const config = require("../../config");
const exec = require("util").promisify(require("child_process").exec);
const oauth = require("../oauth/index");
const path = require("path");
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

	client.on("message", async message => {
		message = JSON.parse(message);
		const { op } = message;
		delete message.op;

		if(client.authenicated === false && op !== "identify") return client.sendJSON({ op: "error", code: 401 });
		switch(op) {
			case "identify": {
				if(!message.token) return client.sendJSON({ op: "error", code: 400 });

				const info = await oauth.info(message.token, "users/@me");
				if(!~config.owners.indexOf(info.id)) return client.sendJSON({ op: "error", code: 403 });

				client.sendHeartbeat();
				client.alive = true;
				delete client.authenicated;
				break;
			}

			case "output": {
				client.sendJSON({ op: "result", code: 200, reuslt: await process.output(message) });

				break;
			}

			case "botStartup": {
				break;
			}

			case "botHardRestart": {
				break;
			}

			case "botRollingRestart": {
				break;
			}

			case "clearRedis": {
				client.sendJSON({ op: "log", message: "Redis database flushed" });

				break;
			}

			case "git-pull": {
				try {
					const { stdout } = await exec("git pull", {
						cwd: path.resolve(__dirname, "..", ".."),
						maxBuffer: Infinity
					});

					client.sendJSON({ op: "log", message: `git pull successful:\n${stdout}` });
				} catch(err) {
					client.sendJSON({ op: "log", message: `git pull errored:\n${err.message}` });
				}

				break;
			}

			case "npm-i": {
				client.sendJSON({ op: "log", message: `npm installing...` });

				try {
					const { stdout } = await exec("npm i", {
						cwd: path.resolve(__dirname, "..", ".."),
						maxBuffer: Infinity
					});

					client.sendJSON({ op: "log", message: `npm i successful:\n${stdout}` });
				} catch(err) {
					client.sendJSON({ op: "log", message: `npm i errored:\n${err.message}` });
				}

				break;
			}

			case "kill": {
				const targetValue = message.id;
				await process.output({ op: "eval", target: "worker", targetValue, input: () => process.exit(0) });
				client.sendJSON({ op: "log", message: `Worker ${targetValue} killed` });

				break;
			}

			case "restart": {
				const targetValue = message.id;
				await process.output({ op: "eval", target: "worker", targetValue, input: () => process.exit(1) });
				client.sendJSON({ op: "log", message: `Worker ${targetValue} restarted` });

				break;
			}

			case "pong": {
				client.alive = true;
				break;
			}

			default: {
				client.sendJSON({ op: "error", code: 400 });
				break;
			}
		}

		return false;
	});
});

server.broadcast = data => server.clients.forEach(client => {
	if(client.readyState !== WebSocket.OPEN) return;
	else client.send(JSON.stringify(data));
});

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
process.evalContext = { server };
