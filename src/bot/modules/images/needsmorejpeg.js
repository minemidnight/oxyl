const Jimp = require("jimp");

async function generate(url) {
	const image = await Jimp.read(url);
	await image.quality(5);

	image.getBase64(Jimp.MIME_JPEG, (err, data) => {
		if(err) throw err;
		process.stdout.write(data);
	});
}

generate(process.env.IMAGE_URL);
