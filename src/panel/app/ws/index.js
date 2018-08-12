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
		const { op } = message;

		switch(op) {
			case "heartbeat": {
				ws.send({ op: "pong" });

				break;
			}

			case "memoryUsage": {
				Object.entries(message.memoryUsage).forEach(([workerID, heapUsed]) => {
					if(!store.workers[workerID]) return;

					if(store.workers[workerID].chartData.memoryUsage) {
						store.workers[workerID].chartData.memoryUsage.push([
							new Date(),
							heapUsed / 1024 / 1024
						]);
					}

					store.workers[workerID].memoryUsage = heapUsed;
				});

				const total = Object.values(message.memoryUsage).reduce((a, b) => a + b, 0);
				if(store.chartData.memoryUsage) store.chartData.memoryUsage.push([new Date(), total / 1024 / 1024]);

				break;
			}

			case "workerReady": {
				const { worker } = message;

				if(!store.workers[worker.id]) {
					app.$set(store.workers, worker.id, {
						id: worker.id,
						startTime: worker.startTime,
						status: worker.status,
						type: worker.type,
						memoryUsage: worker.memoryUsage,
						guilds: worker.guilds,
						streams: worker.streams,
						chartData: {
							memoryUsage: null,
							guilds: null,
							streams: null
						}
					});
				} else {
					store.workers[worker.id].status = "ready";
				}

				break;
			}

			case "workerOnline": {
				const { worker } = message;

				if(!store.workers[worker.id]) {
					app.$set(store.workers, worker.id, {
						id: worker.id,
						startTime: worker.startTime,
						status: worker.status,
						type: worker.type,
						memoryUsage: worker.memoryUsage,
						guilds: worker.guilds,
						streams: worker.streams,
						chartData: {
							memoryUsage: null,
							guilds: null,
							streams: null
						}
					});
				}

				break;
			}

			case "workerOffline": {
				app.$delete(store.workers, message.worker.id);

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

				const totals = Object.values(message.botData).reduce((a, b) => {
					Object.entries(b).forEach(([key, value]) => a[key] = (a[key] || 0) + value);

					return a;
				}, {});

				if(store.chartData.guilds) store.chartData.guilds.push([new Date(), totals.guilds]);
				if(store.chartData.users) store.chartData.users.push([new Date(), totals.users]);
				if(store.chartData.streams) store.chartData.streams.push([new Date(), totals.streams]);
				if(store.chartData.messagesPerSecond) store.chartData.messagesPerSecond.push([new Date(), totals.messages]);

				break;
			}
		}
	};

	return ws;
};
