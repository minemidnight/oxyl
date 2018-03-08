const { createCanvas, Image, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });
registerFont(path.resolve(__dirname, "assets", "Roboto-Bold.ttf"), { family: "Roboto", weight: "bold" });

async function generate(loadout, items) {
	const canvas = createCanvas(625, 265);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#34495E";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold 48px Roboto";
	ctx.fillText(loadout.DeckName, 372.5, 55);

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

	for(let i = 0; i < items.length; i++) {
		const { body: buffer } = await superagent.get(items[i].itemIcon_URL);
		const itemImage = new Image();
		itemImage.src = buffer;
		ctx.drawImage(itemImage, 5 + (i * 125), 130, 110, 110);

		ctx.beginPath();
		ctx.arc(115 + (i * 125), 240, 10, 0, 2 * Math.PI, false);
		ctx.fillStyle = "#39505E";
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#919699";
		ctx.stroke();

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#EBF4FA";
		ctx.font = "bold 12px Roboto";
		ctx.fillText(loadout.LoadoutItems[i].Points, 115 + (i * 125), 240);

		const itemName = items[i].DeviceName;
		let fontSize = 16;
		do {
			ctx.font = `${fontSize}px Roboto`;
			fontSize--;
		} while(ctx.measureText(itemName).width > 102.5);

		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillStyle = "#34495E";
		ctx.fillText(itemName, 5 + (i * 125), 240);
	}

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.LOADOUT), JSON.parse(process.env.ITEMS));
