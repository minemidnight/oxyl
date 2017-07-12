const Snowflake = require("./snowflake.js");
const EventEmitter = require("events").EventEmitter;

class OutputHandler extends EventEmitter {
	constructor(msg) {
		super();
		if(typeof msg.input === "function") {
			msg.input = `(${msg.input.toString().replace(/\\(t|r|n)/gi, "")}).call()`;
		} else if(typeof msg.input === "string") {
			msg.input = `(async function(){${msg.input}}).call()`;
		}

		this.msg = msg;
		this.ended = false;
		this.result = undefined;

		this.msg.id = new Snowflake().id;
		this.msg.output = true;
		process.send(msg);

		this.listener = message => this.verify(message);
		cluster.worker.on("outputMessage", this.listener);
		setTimeout(() => this.stop("time"), 60000);
	}

	verify(msg) {
		if(msg.id !== this.msg.id) return;

		this.result = msg;
		this.stop("finished");
	}

	stop(reason) {
		if(this.ended) return;
		else this.ended = true;
		cluster.worker.removeListener("outputMessage", this.listener);

		this.emit("end", this.result, reason);
	}
}

module.exports = process.output = msg => {
	const handler = new OutputHandler(msg);
	return new Promise(resolve => handler.on("end", resolve));
};
