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

const statuses = {
	0: ctx => {
		ctx.fillStyle = "#515A5A";
		return "Offline";
	},
	1: ctx => {
		ctx.fillStyle = "#F4D03F";
		return "In Lobby";
	},
	2: ctx => {
		ctx.fillStyle = "#F1948A";
		return "Champion Selection";
	},
	3: ctx => {
		ctx.fillStyle = "#E74C3C";
		return "In Game";
	},
	4: ctx => {
		ctx.fillStyle = "#F4D03F";
		return "Online";
	}
};

async function generate({ player, mostUsed, status }) {
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
		const { body: championBuffer } = await superagent.get(mostUsed[i]);
		const championIcon = new Image();
		championIcon.src = championBuffer;

		ctx.drawImage(championIcon, 456 + (i % 2 * 53), i >= 2 ? 120 : 65, 48, 48);
	}

	ctx.fillStyle = "#212F3C";
	ctx.fillRect(260, 140, 158, 20);

	status = statuses[status](ctx);
	ctx.fillRect(262, 142, 154, 16);
	ctx.fillStyle = "black";
	ctx.fillText(`Status: ${status}`, 339, 155);

	process.stdout.write(canvas.toDataURL());
}

process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
	const chunk = process.stdin.read();
	if(!chunk) return;

	generate(JSON.parse(chunk.trim()));
	process.stdin.destroy();
});
