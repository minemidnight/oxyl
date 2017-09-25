const Jimp = require("jimp");

async function generate(url) {
	const image = await Jimp.read(url);
	image.quality(80);

	image.getBase64(Jimp.MIME_JPEG, (err, data) => {
		if(err) throw err;
		process.stdout.write(data);
	});
}

generate(process.env.IMAGE_URL);
