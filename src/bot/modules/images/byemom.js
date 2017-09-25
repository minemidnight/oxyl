const Jimp = require("jimp");

async function generate(text) {
	const textImage = await new Jimp(500, 500);
	const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
	textImage.print(font, 0, 250, text);
	if(text !== "how to rotate text in ms paint") textImage.rotate(-25, false);

	const image = await Jimp.read(`${__dirname}/byemom.png`);
	if(text === "how to rotate text in ms paint") image.composite(textImage, 340, 250);
	else image.composite(textImage, 325, 235);
	image.getBase64(Jimp.MIME_PNG, (err, data) => {
		if(err) throw err;
		process.stdout.write(data);
	});
}

generate(process.env.TEXT);
