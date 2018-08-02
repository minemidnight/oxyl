const fs = require("fs");
const path = require("path");
const handlers = fs.readdirSync(path.resolve(__dirname, "handlers")).reduce((a, b) => {
	a[path.basename(b, path.extname(b))] = require(path.resolve(__dirname, "handlers", b));

	return a;
}, {});

const codes = require("./codes");
const errorFormat = require("./format/error");

module.exports = async (client, message) => {
	try {
		message = JSON.parse(message);
	} catch(err) {
		client.send(errorFormat({
			message: "Message is not JSON",
			code: codes.NOT_JSON
		}));

		return;
	}

	if(!client.authorized && message.op !== "identify") {
		client.send(errorFormat({
			message: "Must identify before using the websocket",
			code: codes.NOT_IDENTIFIED
		}));

		return;
	}

	const handler = handlers[message.op];
	if(!handler) {
		client.send(errorFormat({
			message: "OP code provided is not handled",
			code: codes.INVALID_OP
		}));

		return;
	} else {
		handler(client, message);
	}
};
