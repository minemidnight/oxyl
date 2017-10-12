module.exports = async () => {
	// ws.${window.location.host}
	const ws = new WebSocket(`ws://localhost:7251`);

	ws.onopen = () => {
		console.log("we on the websocket bois");
		ws.send({ op: "identify", token: JSON.parse(localStorage.token) });
	};

	ws.onmessage = message => {
		console.log("message", message);
		message = JSON.parse(message);
	};

	return ws;
};
