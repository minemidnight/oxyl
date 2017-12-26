const { createCanvas, Image, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });

async function generate(item) {
	const { body: itemBuffer } = await superagent.get(item.itemIcon_URL);
	const itemIcon = new Image();
	itemIcon.src = itemBuffer;

	const canvas = createCanvas(itemIcon.width + 25, itemIcon.height + 25);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(itemIcon, 12.5, 12.5);

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.ITEM));
