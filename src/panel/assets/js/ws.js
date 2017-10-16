module.exports = async () => {
	// ws.${window.location.host}
	const ws = new WebSocket(`ws://localhost:7251`);
	ws.sendJSON = json => ws.send(JSON.stringify(json));

	ws.onopen = () => {
		ws.sendJSON({ op: "identify", token: JSON.parse(localStorage.token) });
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
				// app.workers.push(message);
				app.logs.push(`Worker ${message.id} online, type ${message.type}`);

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
				ws.sendJSON({ op: "pong" });
				app.workers = message.workers;

				break;
			}
		}
	};

	return ws;
};
