const waitingOutputs = new Map();

module.exports = async message => {
	const reply = data => process.send(Object.assign(data, { id: message.id }));
	switch(message.op) {
		case "eval": {
			const { input } = message;

			try {
				const context = process.evalContext; // eslint-disable-line no-unused-vars
				const result = await eval(input);
				reply({ op: "result", error: false, result });
			} catch(err) {
				console.log("err", err.stack);
				reply({ op: "result", error: true, message: err.message });
			}

			break;
		}

		case "exit": {
			process.exit(message.code || 0);

			break;
		}

		case "result": {
			if(!waitingOutputs.has(message.id)) return;
			waitingOutputs.get(message.id)(message);

			break;
		}
	}
};

require("./processOutput")(waitingOutputs, "worker");
