const config = require("../../config");
const exec = require("util").promisify(require("child_process").exec);
const oauth = require("../oauth/index");
const path = require("path");

module.exports = async (client, message) => {
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

		case "startBot": {
			await process.output({ op: "startBot" });

			break;
		}

		case "restartBotHard": {
			await process.output({ op: "restartBotHard" });

			break;
		}

		case "restartBotRolling": {
			await process.output({ op: "restartBotRolling" });

			break;
		}

		case "exec": {
			try {
				const { stdout } = await exec(message.command, {
					cwd: path.resolve(__dirname, "..", ".."),
					maxBuffer: Infinity
				});

				client.sendJSON({ op: "log", message: stdout });
			} catch(err) {
				client.sendJSON({ op: "log", message: err.message });
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

		case "startSite": {
			await process.output({ op: "startSite" });

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
};
