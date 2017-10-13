module.exports = async () => {
	// ws.${window.location.host}
	const ws = new WebSocket(`ws://localhost:7251`);
	ws.sendJSON = json => ws.send(JSON.stringify(json));

	ws.onopen = () => {
		console.log("we on the websocket bois");
		ws.sendJSON({ op: "identify", token: JSON.parse(localStorage.token) });
	};

	ws.onmessage = ({ data: message }) => {
		message = JSON.parse(message);
		console.log("message", message);
	};

	return ws;
};
