const { createCanvas, Image } = require("canvas");
const superagent = require("superagent");

async function generate(images, overlap) {
	const imageBuffers = await Promise.all(images.map(async image => (await superagent.get(image)).body));
	images = imageBuffers.map(buffer => {
		const image = new Image();
		image.src = buffer;

		return image;
	});

	let width;
	if(overlap) width = Math.max(...images.map(image => image.width));
	else width = images.map(image => image.width).reduce((a, b) => a + b);

	const canvas = createCanvas(width, Math.max(...images.map(image => image.height)));
	const ctx = canvas.getContext("2d");

	if(overlap) {
		images.forEach(image => ctx.drawImage(image, 0, 0));
	} else {
		images.reduce((xCoordinate, image) => {
			ctx.drawImage(image, xCoordinate, 0);
			return xCoordinate + image.width;
		}, 0);
	}

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.IMAGES), process.env.OVERLAP === "true");
