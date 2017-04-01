const EventEmitter = require("events").EventEmitter;
class MessageCollector extends EventEmitter {
	constructor(channel, filter, options = {}) {
		super();
		this.filter = filter;
		this.channel = channel;
		this.options = options;
		this.ended = false;
		this.collected = [];

		this.listener = message => this.verify(message);
		bot.on("messageCreate", this.listener);
		if(options.time) setTimeout(() => this.stop("time"), options.time);
	}

	verify(message) {
		if(this.channel.id !== message.channel.id) return false;
		if(this.filter(message)) {
			this.collected.push(message);

			this.emit("message", message);
			if(this.collected.length >= this.options.maxMatches) this.stop("maxMatches");
			return true;
		}
		return false;
	}

	stop(reason) {
		if(this.ended) return;
		this.ended = true;
		bot.removeListener("messageCreate", this.listener);

		this.emit("end", this.collected, reason);
	}
}

module.exports = async (channel, filter, options) => {
	const collector = new MessageCollector(channel, filter, options);
	return new Promise((resolve, reject) => {
		collector.on("end", (collection, reason) => {
			if(!collection || collection.size === 0) {
				resolve(collection, reason);
			} else {
				resolve(collection, reason);
			}
		});
	});
};
