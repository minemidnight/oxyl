const { createCanvas, Image, loadImage, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });
registerFont(path.resolve(__dirname, "assets", "Roboto-Bold.ttf"), { family: "Roboto", weight: "bold" });

const ranks = ["Unranked",
	"Bronze V", "Bronze IV", "Bronze III", "Bronze II", "Bronze I",
	"Silver V", "Silver IV", "Silver III", "Silver II", "Silver I",
	"Gold V", "Gold IV", "Gold III", "Gold II", "Gold I",
	"Platinum V", "Platinum IV", "Platinum III", "Platinum II", "Platinum I",
	"Diamond V", "Diamond IV", "Diamond III", "Diamond II", "Diamond I",
	"Master", "Grandmaster"];

async function generate(player, mostUsedChampionsImages) {
	const canvas = createCanvas(600, 170);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 20, canvas.width, canvas.height);

	ctx.fillStyle = "#1C2833";
	ctx.fillRect(0, 0, canvas.width, 20);

	ctx.textAlign = "center";
	ctx.fillStyle = "#EBF5FB";
	ctx.font = "16px Roboto";
	ctx.fillText(`Overview: ${player.Name}`, canvas.width / 2, 15);

	ctx.beginPath();
	ctx.arc(80, 100, 60, Math.PI / 180 * 118, Math.PI / 180 * 420);
	ctx.strokeStyle = "rgba(166, 172, 175, 0.9)";
	ctx.lineWidth = 12;
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.arc(80, 100, 60, Math.PI / 180 * 120, Math.PI / 180 * 418);
	ctx.strokeStyle = "#90CE49";
	ctx.lineWidth = 6;
	ctx.stroke();
	ctx.closePath();

	ctx.fillStyle = "#34495E";
	ctx.font = "12px Roboto";
	ctx.fillText("LVL", 80, 80);

	ctx.font = "48px Roboto";
	ctx.fillText(player.Level, 80, 120);

	ctx.fillStyle = "#797D7F";
	ctx.fillRect(168, 35, 250, 25);

	ctx.fillStyle = "#90CE49";
	ctx.fillRect(170.5, 37.5, 245 * Math.min(player.RankedConquest.Points, 100) / 100, 20);

	ctx.fillStyle = "white";
	ctx.font = "bold 16px Roboto";
	ctx.fillText(`${player.RankedConquest.Points} TP`, 293, 53);

	ctx.textAlign = "left";
	ctx.fillStyle = "#34495E";

	let fontSize = 40;
	do {
		ctx.font = `${fontSize}px Roboto`;
		fontSize--;
	} while(ctx.measureText(ranks[player.RankedConquest.Tier]).width > 155);
	ctx.fillText(ranks[player.RankedConquest.Tier], 260, 100);

	ctx.textAlign = "left";
	ctx.font = "16px Roboto";
	ctx.fillText(`${player.RankedConquest.Wins} - ${player.RankedConquest.Losses}`, 260, 120);

	const image = await loadImage(path.resolve(__dirname, "assets", "ranks", `${player.RankedConquest.Tier}.png`));
	ctx.drawImage(image, 165, 65);

	ctx.textAlign = "center";
	ctx.font = "12px Roboto";
	ctx.fillText(`Most Played\nChampions`, 509, 44);

	for(let i = 0; i < 4; i++) {
		const { body: championBuffer } = await superagent.get(mostUsedChampionsImages[i]);
		const championIcon = new Image();
		championIcon.src = championBuffer;

		ctx.drawImage(championIcon, 456 + (i % 2 * 53), i >= 2 ? 120 : 65, 48, 48);
	}

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.PLAYER), JSON.parse(process.env.MOSTUSED));
