const { createCanvas, Image, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });
registerFont(path.resolve(__dirname, "assets", "Roboto-Bold.ttf"), { family: "Roboto", weight: "bold" });

async function generate({ loadout, items }) {
	const canvas = createCanvas(525, 725);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#34495E";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold 48px Roboto";
	ctx.fillText(loadout.DeckName, 322.5, 55);

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
		ctx.drawImage(itemImage, 10, 130 + (i * 120), 100, 100);

		ctx.beginPath();
		ctx.arc(105, 230 + (i * 120), 12.5, 0, 2 * Math.PI, false);
		ctx.fillStyle = "#39505E";
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#919699";
		ctx.stroke();

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#EBF4FA";
		ctx.font = "bold 16px Roboto";
		ctx.fillText(loadout.LoadoutItems[i].Points, 105, 230 + (i * 120));

		ctx.font = "30px Roboto";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillStyle = "#34495E";
		ctx.fillText(items[i].DeviceName, 120, 130 + (i * 120));

		ctx.font = "16px Roboto";
		let description = items[i].Description.substring(items[i].Description.indexOf("]") + 1)
				.trim()
				.replace(/\{scale=(.+?)\|(.+?)\}/, (match, start, scaleBy) =>
					parseFloat(start) + (parseFloat(scaleBy) * (loadout.LoadoutItems[i].Points - 1))
				)
				.split(" "), lineNumber = 0;

		while(description.length) {
			const line = description.slice();
			while(ctx.measureText(line.join(" ")).width > canvas.width - 130) line.splice(-1);

			ctx.fillText(line.join(" "), 120, (i * 120) + (lineNumber * 18) + 165);
			lineNumber++;
			description = description.slice(line.length);
		}
	}

	process.stdout.write(canvas.toDataURL());
}

process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
	const chunk = process.stdin.read();
	if(!chunk) return;

	generate(JSON.parse(chunk.trim()));
	process.stdin.destroy();
});
