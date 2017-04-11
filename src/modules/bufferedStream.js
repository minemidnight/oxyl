const Stream = require("stream");
const https = require("https");
const http = require("http");
const URL = require("url");

module.exports = (url, output = new Stream.PassThrough(), meta = { downloaded: 0, total: 0 }) => {
	if(output._destroyed) return output;

	let input;
	output.destroy = () => {
		this._destroyed = true;
		if(input) {
			input.unpipe();
			input.destroy();
		}
	};

	const options = typeof url === "string" ? URL.parse(url) : url;
	if(!options.headers) options.headers = {};

	(options.protocol === "https:" ? https : http).get(options, (res) => {
		output.resume();
		input = res;

		if(meta.downloaded === 0) meta.total = Number(input.headers["content-length"]);

		input.on("data", (chunk) => {
			meta.downloaded += Buffer.byteLength(chunk);
		});

		input.on("end", () => {
			if(meta.downloaded < meta.total) {
				input.unpipe();
				options.headers.Range = `bytes=${meta.downloaded}-`;
				module.exports(options, output, meta);
			} else {
				output.end();
			}
		});

		input.on("error", (err) => {
			if(!err) return;
			console.log(err);
			if(err.message === "read ECONNRESET") {
				output.pause();
				return;
			}

			output.emit("error", err);
		});

		input.pipe(output, { end: false });
	});

	return output;
};
