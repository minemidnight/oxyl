export default {
	terminal: [],
	workers: [{
		id: 1,
		type: "ws",
		startTime: 1531274739105,
		memoryUsage: 322122547,
		chartData: {}
	}, {
		id: 6,
		type: "oxylscript/editor",
		startTime: 1531274153105,
		memoryUsage: 947124912,
		chartData: {}
	}, {
		id: 6,
		type: "oxylscript/editor",
		startTime: 1531274153105,
		memoryUsage: 947124912,
		chartData: {}
	}, {
		id: 6,
		type: "oxylscript/editor",
		startTime: 1531274153105,
		memoryUsage: 947124912,
		chartData: {}
	}, {
		id: 3,
		type: "bot",
		startTime: 1531244119105,
		memoryUsage: 21812394,
		chartData: {
			guilds: [
				["Time", "Guilds"],
				...Array.from({ length: 60 }, (val, i) =>
					[new Date(Date.now() - (i * (3000000 + Math.floor(Math.random() * 50000)))),
						15000 - (i * (100 + Math.floor(Math.random() * 5)))])
			],
			memory: [
				["Time", "GiB"],
				...Array.from({ length: 60 }, (val, i) =>
					[new Date(Date.now() - (i * (3000000 + Math.floor(Math.random() * 50000)))),
						(521812394 + (((1000000 / 2) - Math.floor(Math.random() * 1000000)))) / 1024 / 1024 / 1024
					])
			]
		}
	}]
};
