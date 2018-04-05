const { createCanvas, Image, loadImage, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });

async function generate({ champions, page, totalPages }) {
	const canvas = createCanvas(200, (champions.length * 200) + 25);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for(let i = 0; i < champions.length; i++) {
		const champion = champions[i];
		const yBase = i * 200;

		ctx.beginPath();
		ctx.moveTo(0, yBase + 200);
		ctx.lineTo(canvas.width, yBase + 200);
		ctx.stroke();
		ctx.closePath();

		ctx.fillStyle = "#34495E";
		ctx.textAlign = "center";

		let fontSize = 36;
		do {
			ctx.font = `${fontSize}px Roboto`;
			fontSize--;
		} while(ctx.measureText(champion.Name).width > canvas.width - 72);
		ctx.fillText(champion.Name, canvas.width / 2, yBase + fontSize + 4);

		const { body: championBuffer } = await superagent.get(champion.ChampionIcon_URL);
		const championIcon = new Image();
		championIcon.src = championBuffer;

		ctx.drawImage(championIcon,
			(canvas.width / 2) - ((140 + (36 - fontSize)) / 2),
			yBase + fontSize + 16,
			140 + (36 - fontSize),
			140 + (36 - fontSize)
		);

		const classIcon = await loadImage(
			path.resolve(__dirname, "assets", "classes", `${champion.Roles.substring(9).toLowerCase().replace(" ", "")}.png`)
		);
		ctx.drawImage(classIcon, canvas.width - 4 - fontSize, yBase + 4, fontSize, fontSize);
	}

	ctx.fillStyle = "#34495E";
	ctx.font = `16px Roboto`;
	ctx.fillText(`Page ${page || 1} of ${totalPages}`, canvas.width / 2, canvas.height - 7);

	process.stdout.write(canvas.toDataURL());
}

process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
	const chunk = process.stdin.read();
	if(!chunk) return;

	generate(JSON.parse(chunk.trim()));
	process.stdin.destroy();
});
