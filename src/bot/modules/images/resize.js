const { createCanvas, Image } = require("canvas");
const superagent = require("superagent");

async function generate(image, width, height) {
	const { body } = await superagent.get(image);
	image = new Image();
	image.src = body;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0, width, height);

	process.stdout.write(canvas.toDataURL());
}

generate(process.env.IMAGE, parseInt(process.env.WIDTH), parseInt(process.env.HEIGHT));
