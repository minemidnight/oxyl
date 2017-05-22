const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
if(!publicConfig.websocketServer) return;
const privateConfig = JSON.parse(require("fs").readFileSync("private-config.json").toString());
const WebSocket = require("ws");
const webhook = require("../modules/webhookStatus.js");

const wss = new WebSocket.Server({
	perMessageDeflate: false,
	port: 7025,
	verifyClient: info => info.req.headers.authorization === privateConfig.secret
});
console.startup("Websocket server started on port 7025 (authorization: bot secret)");
webhook({
	title: `Websocket Server Started`,
	color: 0x00FF00,
	description: `Port: 7025\nAuthorization: Bot secret`,
	timestamp: new Date()
});

wss.on("connection", ws => {
	console.info(`Websocket connection`);
	webhook({
		title: `Websocket Connection`,
		color: 0x00FF00,
		description: `Passed verification`,
		timestamp: new Date()
	});

	ws.on("message", async message => {
		let data = JSON.parse(message);
		if(data.type === "masterEval") {
			try {
				let result = await eval(data.input);
				ws.send(JSON.parse({ type: "output", result, id: data.id }));
			} catch(err) {
				ws.send(JSON.parse({ type: "output", error: err.stack, id: data.id }));
			}
		} else if(data.type === "guildEval") {
			data.target = ["guild", data.guildID];
			data.type = "eval";
			process.waitingOutputs[data.id] = {
				expected: 1,
				results: [],
				callback: results => ws.send(JSON.stringify({ type: "output", result: results[0], id: data.id }))
			};
			process.handleMessage(data);
		} else if(data.type === "globalEval") {
			process.waitingOutputs[data.id] = {
				expected: cluster.onlineWorkers.length,
				results: [],
				callback: results => ws.send(JSON.stringify({ type: "output", results, id: data.id }))
			};
			process.handleMessage(data);
		}
	});
});
