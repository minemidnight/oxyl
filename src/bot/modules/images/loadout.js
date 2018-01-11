const { createCanvas, Image, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });
registerFont(path.resolve(__dirname, "assets", "Roboto-Bold.ttf"), { family: "Roboto", weight: "bold" });

async function generate(loadout, items) {
	const canvas = createCanvas(600, 260);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#34495E";
	ctx.textBaseline = "middle";
	ctx.textAlign = "left";
	ctx.font = "bold 48px Roboto";
	ctx.fillText(loadout.DeckName, 227.5, 55);

	const { body: championBuffer } = await superagent.get(`https://web2.hirez.com/paladins/champion-icons/` +
		`${loadout.ChampionName.toLowerCase().replace("'", "").replace(" ", "-")}.jpg`);
	const championIcon = new Image();
	championIcon.src = championBuffer;
	ctx.drawImage(championIcon, 10, 10, 100, 100);

	ctx.beginPath();
	ctx.moveTo(0, 120);
	ctx.lineTo(canvas.width, 120);
	ctx.stroke();
	ctx.closePath();

	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	for(let i = 0; i < items.length; i++) {
		const { body: buffer } = await superagent.get(items[i].itemIcon_URL);
		const itemImage = new Image();
		itemImage.src = buffer;
		ctx.drawImage(itemImage, 5 + (i * 120), 130, 110, 110);

		const itemName = items[i].DeviceName.slice(0, -2);
		let fontSize = 16;
		do {
			ctx.font = `${fontSize}px Roboto`;
			fontSize--;
		} while(ctx.measureText(itemName).width > 115);
		ctx.fillText(itemName, 60 + (i * 120), 240);
	}

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.LOADOUT), JSON.parse(process.env.ITEMS));
