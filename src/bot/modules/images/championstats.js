const { createCanvas, Image, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });
registerFont(path.resolve(__dirname, "assets", "Roboto-Bold.ttf"), { family: "Roboto", weight: "bold" });

async function generate(stats) {
	const canvas = createCanvas(375, 137.5);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const { body: championBuffer } = await superagent.get(`https://web2.hirez.com/paladins/champion-icons/` +
		`${stats.champion.toLowerCase().replace("'", "").replace(" ", "-")}.jpg`);
	const championIcon = new Image();
	championIcon.src = championBuffer;
	ctx.drawImage(championIcon, 5, 5, 100, 100);

	ctx.fillStyle = "#34495E";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";

	let fontSize = 24;
	do {
		ctx.font = `${fontSize}px Roboto`;
		fontSize--;
	} while(ctx.measureText(stats.champion).width > 100);
	ctx.fillText(stats.champion, 55, 105);

	const days = Math.floor(stats.Minutes / 1440);
	const hours = Math.floor(stats.Minutes % 1440 / 60);

	const texts = [
		`${stats.Kills} / ${stats.Deaths} / ${stats.Assists}`,
		`${stats.Wins} - ${stats.Losses} (${(stats.Wins / stats.Matches * 100).toFixed(2)}%)`,
		`${(days ? `${days}D ` : "") + (hours ? `${hours}H ` : "")}${stats.Minutes % 1440 % 60}M`
	];

	ctx.font = "18px Roboto";
	ctx.textBaseline = "center";
	const width = Math.max(...texts.map(text => ctx.measureText(text).width));

	ctx.fillText(texts[0], 110 + (width / 2), 5);
	ctx.fillText(texts[1], 110 + (width / 2), 45);
	ctx.fillText(texts[2], 110 + (width / 2), 85);

	ctx.font = "bold 12px Roboto";
	ctx.fillText("K / D / A", 110 + (width / 2), 25);
	ctx.fillText("WINS - LOSSES", 110 + (width / 2), 65);
	ctx.fillText("PLAY TIME", 110 + (width / 2), 105);

	ctx.beginPath();
	ctx.arc(canvas.width - 65, 65, 50, Math.PI / 180 * 118, Math.PI / 180 * 420);
	ctx.strokeStyle = "rgba(166, 172, 175, 0.9)";
	ctx.lineWidth = 12;
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.arc(canvas.width - 65, 65, 50, Math.PI / 180 * 120, Math.PI / 180 * 418);
	ctx.strokeStyle = "#90CE49";
	ctx.lineWidth = 6;
	ctx.stroke();
	ctx.closePath();

	ctx.font = "12px Roboto";
	ctx.fillText("LVL", canvas.width - 65, 35);

	ctx.font = "48px Roboto";
	ctx.fillText(stats.Rank, canvas.width - 65, 40);

	ctx.font = "10px Roboto";
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
	ctx.fillText("Data from Competitive Matches", canvas.width - 5, canvas.height);

	process.stdout.write(canvas.toDataURL());
}

process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
	const chunk = process.stdin.read();
	if(!chunk) return;

	generate(JSON.parse(chunk.trim()));
	process.stdin.destroy();
});
