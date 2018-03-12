const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");

if(!fs.existsSync(path.resolve(__dirname, "saved"))) fs.mkdirSync(path.resolve(__dirname, "saved"));
module.exports = fs.readdirSync(__dirname).reduce((a, b) => {
	const base = path.basename(b, path.extname(b));
	if(path.extname(b) !== ".js" || base === "index") return a;

	a[base] = async data => {
		const env = {};
		Object.entries(data).forEach(([key, value]) => {
			if(typeof value === "object") value = JSON.stringify(value);
			env[key.toUpperCase()] = value;
		});

		const { stdout } = await exec(`node ${path.resolve(__dirname, b)}`, { env, maxBuffer: Infinity });
		const dataURI = stdout.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
		dataURI[2] = Buffer.from(dataURI[2], "base64");

		return { buffer: dataURI[2], ext: dataURI[1] };
	};

	return a;
}, {});

