const fs = require("fs");
const path = require("path");

const appendFile = require("util").promisify(fs.appendFile);

class Logger {
	constructor(level, r) {
		this.r = r;
		this.level = level;

		const logFolder = path.resolve(__dirname, "..", "..", "logs");
		this.file = path.resolve(logFolder, `${level}.log`);

		if(!fs.existsSync(logFolder)) fs.mkdirSync(logFolder);
		if(!fs.existsSync(this.file)) fs.writeFileSync(this.file, "");
	}

	log(label, message) {
		const timestamp = new Date().toLocaleString();
		label = label.toUpperCase();

		const formatted = `${timestamp} [${label}] {${this.level.toUpperCase()}} ${message}`;

		this.write(formatted);
		this.insert(label, message);

		if(this.level === "debug") return;
		(console[this.level] || console.log)(formatted);
	}

	write(message) {
		appendFile(this.file, `${message}\n`);
	}

	insert(label, message) {
		this.r.table("logs").insert({
			level: this.level,
			label,
			message,
			time: Date.now()
		}).run();
	}
}

module.exports = Logger;
