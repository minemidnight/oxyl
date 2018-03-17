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

	const winRate = (stats.Wins / (stats.Wins + stats.Losses) * 100).toFixed(2);

	ctx.font = "18px Roboto";
	ctx.textBaseline = "center";
	const width = Math.max(
		...[`${stats.Kills} / ${stats.Deaths} / ${stats.Assists}`, `${stats.Wins} - ${stats.Losses} (${winRate}%)`]
			.map(text => ctx.measureText(text).width)
	);

	ctx.fillText(`${stats.Kills} / ${stats.Deaths} / ${stats.Assists}`, 110 + (width / 2), 5);
	ctx.fillText(`${stats.Wins} - ${stats.Losses} (${winRate}%)`, 110 + (width / 2), 50);

	ctx.font = "bold 14px Roboto";
	ctx.fillText("K / D / A", 110 + (width / 2), 30);
	ctx.fillText("Wins - Losses", 110 + (width / 2), 75);

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

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.CHAMPIONINFO));
