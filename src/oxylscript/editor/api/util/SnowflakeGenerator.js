const cluster = require("cluster");
const format = require("biguint-format");

class SnowflakeGenerator {
	constructor(datacenter, worker, epoch) {
		this.datacenter = datacenter;
		this.worker = worker;
		this.epoch = epoch;

		this.id = ((((datacenter || 0) & 0x1F) << 5) | ((worker || 0) & 0x1F)) << 12;
	}

	next() {
		const flake = Buffer.alloc(8),
			time = Date.now() - this.epoch;

		flake.fill(0);
		flake.writeUInt32BE(((time & 0x3) << 22) | this.id, 4);
		flake.writeUInt8(Math.floor(time / 4) & 0xFF, 4);
		flake.writeUInt16BE(Math.floor(time / Math.pow(2, 10)) & 0xFFFF, 2);
		flake.writeUInt16BE(Math.floor(time / Math.pow(2, 26)) & 0xFFFF, 0);
		return format(flake, "dec");
	}
}

module.exports = new SnowflakeGenerator(0, cluster.worker.id, new Date(2018).getTime());
