const config = require("../../config");
const oauth = require("../oauth/index");
const WebSocket = require("ws");
const server = new WebSocket.Server({
	port: config.websocketPort,
	verifyClient: ({ req }, cb) => {
		if(!req.headers.Authorization) return cb({ result: false, code: 401, name: "No Authorization header" });
		let auth;
		try {
			auth = JSON.parse(req.headers.Authorization);
		} catch(err) {
			return cb({ result: false, code: 400, name: "Authorization header not JSON" });
		}

		const info = oauth.info(auth, "users/@me");
		if(~config.owners.indexOf(info.id)) return cb({ result: true });
		else return cb({ result: false, code: 403, name: "Forbidden" });
	}
});

server.on("connection", ws => {
	ws.on("message", nessage => {

	});
});
