const Jimp = require("jimp");

async function generate(text) {
	const textImage = await new Jimp(500, 500);
	const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
	textImage.print(font, 0, 250, text);
	textImage.rotate(35);

	const image = await Jimp.read(`${__dirname}/byemom.png`);
	image.composite(textImage, 200, 200);
	image.getBase64(Jimp.MIME_PNG, (err, data) => process.stdout.write(data));
}

generate(process.env.TEXT);
