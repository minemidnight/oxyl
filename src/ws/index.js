const config = require("../../config");
const oauth = require("../oauth/index");
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: config.websocketPort });

server.on("connection", ws => {
	ws.authenicated = false;
	ws.sendJSON = json => ws.send(JSON.stringify(json));

	ws.on("message", async message => {
		message = JSON.parse(message);

		if(ws.authenicated === false && message.op !== "identify") return message.sendJSON({ op: "error", code: 401 });
		switch(message.op) {
			case "identify": {
				if(!message.token) return ws.sendJSON({ op: "error", code: 400 });

				const info = await oauth.info(message.token, "users/@me");
				if(!~config.owners.indexOf(info.id)) return ws.sendJSON({ op: "error", code: 403 });

				delete ws.authenicated;
				break;
			}

			default: {
				return message.sendJSON({ op: "error", code: 400 });
			}
		}

		return false;
	});
});
