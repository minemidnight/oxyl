module.exports = async () => {
	const ws = new WebSocket(process.env.NODE_ENV === "development" ?
		`ws://localhost:7251` :
		`wss://${window.location.host}/ws/`);

	ws._send = ws.send;
	ws.send = json => ws._send(JSON.stringify(json));

	ws.onopen = () => {
		ws.send({ op: "identify", token: JSON.parse(localStorage.token) });
	};

	ws.onmessage = ({ data: message }) => {
		message = JSON.parse(message);
		const { op } = message;
		delete message.op;

		switch(op) {
			case "workerOffline": {
				const worker = app.workers.find(({ id }) => id === message.workerID);
				app.logs.push(`Worker ${worker.id} died, code ${message.code}`);
				worker.status = "offline";

				break;
			}

			case "workerOnline": {
				app.workers.push(message);
				app.logs.push(`Worker ${message.workerID} online, type ${message.type}`);

				break;
			}

			case "workerReady": {
				const worker = app.workers.find(({ id }) => id === message.workerID);
				worker.status = "ready";
				app.logs.push(`Worker ${worker.id} ready`);

				break;
			}

			case "log": {
				app.logs.push(message.message);

				break;
			}

			case "heartbeat": {
				ws.send({ op: "pong" });
				app.workers = message.workers;

				break;
			}

			case "logs": {
				app.logs.push(...message.messages);

				break;
			}
		}
	};

	return ws;
};
