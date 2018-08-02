import store from "../store";

export default async () => {
	const ws = new WebSocket(process.env.NODE_ENV === "development" ?
		"ws://localhost:7251" :
		`wss://${window.location.origin}/ws`);

	ws._send = ws.send;
	ws.send = json => ws._send(JSON.stringify(json));

	ws.onopen = () => {
		ws.send({
			op: "identify",
			token: JSON.parse(localStorage.token)
		});
	};

	ws.onmessage = ({ data: message }) => {
		message = JSON.parse(message);
		console.log(message);
		const { op } = message;

		switch(op) {
			case "heartbeat": {
				ws.send({ op: "pong" });

				break;
			}

			case "memoryUsage": {
				Object.entries(message.memory).forEach(([workerID, heapUsed]) => {
					if(!store.workers[workerID]) return;

					if(store.workers[workerID].chartData.memory) {
						store.workers[workerID].chartData.memory.push([
							new Date(),
							heapUsed / 1024 / 1024
						]);
					}

					store.workers[workerID].memoryUsage = heapUsed;
				});

				break;
			}

			case "botData": {
				Object.entries(message.botData).forEach(([workerID, { guilds, streams }]) => {
					if(!store.workers[workerID]) return;

					if(store.workers[workerID].chartData.guilds) {
						store.workers[workerID].chartData.guilds.push([
							new Date(),
							guilds
						]);
					}

					if(store.workers[workerID].chartData.streams) {
						store.workers[workerID].chartData.streams.push([
							new Date(),
							streams
						]);
					}

					store.workers[workerID].guilds = guilds;
					store.workers[workerID].streams = streams;
				});

				break;
			}
		}
	};

	return ws;
};
