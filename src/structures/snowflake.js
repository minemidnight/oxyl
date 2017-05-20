const bigNumber = require("big-number");
class Snowflake {
	constructor() {
		this.timestamp = Date.now();
		this.id = bigNumber(this.timestamp)
			.subtract(1420070400000)
			.multiply(4194304)
			.add(cluster.isWorker ? cluster.worker.id : 0)
			.toString();
	}
}
module.exports = Snowflake;
