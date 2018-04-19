const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

if(!fs.existsSync(path.resolve(__dirname, "saved"))) fs.mkdirSync(path.resolve(__dirname, "saved"));
module.exports = fs.readdirSync(__dirname).reduce((a, b) => {
	const base = path.basename(b, path.extname(b));
	if(path.extname(b) !== ".js" || base === "index") return a;

	a[base] = stdin => new Promise((resolve, reject) => {
		const process = exec(`node ${path.resolve(__dirname, b)}`, { maxBuffer: Infinity }, (err, stdout, stderr) => {
			if(stderr || (err && err.message)) {
				reject(new Error(stderr || (err && err.message)));
				return;
			}

			const dataURI = stdout.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
			dataURI[2] = Buffer.from(dataURI[2], "base64");
			resolve({ buffer: dataURI[2], ext: dataURI[1] });
		});

		process.stdin.write(JSON.stringify(stdin));
	});

	return a;
}, {});

