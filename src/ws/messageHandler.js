const config = require("../../config");
const exec = require("util").promisify(require("child_process").exec);
const path = require("path");
const OAuth2 = require("../oauth2/index");
const discordAuth = new OAuth2({
	api: "https://discordapp.com/api/",
	oauth2: "https://discordapp.com/api/oauth2/"
}, {
	clientID: config.clientID,
	secret: config.secret,
	redirectURI: config.panelURL
});

module.exports = async (client, message) => {
	message = JSON.parse(message);
	const { op } = message;
	delete message.op;

	if(client.authenicated === false && op !== "identify") return client.send({ op: "error", code: 401 });
	switch(op) {
		case "identify": {
			if(!message.token) return client.send({ op: "error", code: 400 });

			const info = await discordAuth.info(message.token, "users/@me");
			if(!~config.owners.indexOf(info.id)) return client.send({ op: "error", code: 403 });

			client.heartbeat();
			client.alive = true;
			delete client.authenicated;

			client.send({
				op: "logs",
				messages: (await client.server.redis.multi(
					(await client.server.redis.keys("logs::*")).map(key => ["get", key])
				).exec()).map(([, data]) => data)
			});

			break;
		}

		case "output": {
			client.send({ op: "result", code: 200, result: await process.output(message) });

			break;
		}

		case "restartBotHard": {
			client.send({ op: "log", message: "Hard restarting bot..." });
			await process.output({ op: "restartBotHard" });
			client.send({ op: "log", message: "Hard restart finished" });

			break;
		}

		case "restartBotRolling": {
			client.send({ op: "log", message: "Rolling restarting bot..." });
			await process.output({ op: "restartBotRolling" });
			client.send({ op: "log", message: "Rolling restarting finished" });

			break;
		}

		case "exec": {
			try {
				const { stdout } = await exec(message.command, {
					cwd: path.resolve(__dirname, "..", ".."),
					maxBuffer: Infinity
				});

				client.send({ op: "log", message: stdout });
			} catch(err) {
				client.send({ op: "log", message: err.message });
			}

			break;
		}

		case "kill": {
			const targetValue = message.id;
			await process.output({ op: "eval", target: "worker", targetValue, input: () => process.exit(0) });
			client.send({ op: "log", message: `Worker ${targetValue} killed` });

			break;
		}

		case "restart": {
			const targetValue = message.id;
			await process.output({ op: "eval", target: "worker", targetValue, input: () => process.exit(1) });
			client.send({ op: "log", message: `Worker ${targetValue} restarted` });

			break;
		}

		case "pong": {
			client.alive = true;

			break;
		}

		default: {
			client.send({ op: "error", code: 400 });

			break;
		}
	}

	return false;
};
