const { createCanvas, Image, loadImage } = require("canvas");
const path = require("path");
const superagent = require("superagent");

function getLines(ctx, unsplitText, initialLine) {
	const lines = [];
	let text = unsplitText.split(" "), lineNumber = initialLine;

	while(text.length) {
		const line = text.slice();
		while(ctx.measureText(line.join(" ")).width > 105 - (Math.abs(lineNumber - 2) * (Math.abs(lineNumber - 2) * 14))) {
			if(line.length === 1) {
				if(text.length === 1) text.push(line[0].substr(-1));
				else text[text.length - 1] += line[0].substr(-1);
				line[0] = line[0].slice(0, -1);
			} else {
				line.splice(-1);
			}
		}

		lines.push([line.join(" "), 317, 251 + (lineNumber * 16)]);
		lineNumber++;

		if(lineNumber === 5) break;
		else text = text.slice(line.length);
	}

	if(initialLine || lines.length === 5) return lines;
	return getLines(ctx, unsplitText, Math.abs(2 - lines.length));
}

async function generate(text, avatar) {
	const image = await loadImage(path.resolve(__dirname, "assets", "killed.png"));

	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0);

	ctx.font = "14px Arial";
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";

	const lines = getLines(ctx, text);
	lines.forEach(line => ctx.fillText(...line));

	if(avatar) {
		const { body: buffer } = await superagent.get(avatar);
		avatar = new Image();
		avatar.src = buffer;
		ctx.drawImage(avatar, 30, 148, 60, 60);
		ctx.drawImage(avatar, 220, 148, 60, 60);
		ctx.drawImage(avatar, 405, 148, 60, 60);
	}

	process.stdout.write(canvas.toDataURL());
}

generate(process.env.TEXT, process.env.AVATAR);
