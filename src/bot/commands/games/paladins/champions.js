const { createCanvas, Image, loadImage, registerFont } = require("canvas");
const path = require("path");
const { request } = require("../../../modules/PaladinsAPI");
const superagent = require("superagent");

registerFont(path.resolve("src", "bot", "modules", "images", "assets", "Roboto.ttf"), { family: "Roboto" });

module.exports = {
	async run({ args: [page], t, wiggle }) {
		const canvas = createCanvas(200, 625);
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "#F2F3F4";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for(let i = ((page || 1) - 1) * 3; i < (page || 1) * 3; i++) {
			const champion = champions[i];
			const yBase = (i - (((page || 1) - 1) * 3)) * 200;

			ctx.strokeStyle = "#5F6A6A";
			ctx.beginPath();
			ctx.moveTo(0, yBase);
			ctx.lineTo(canvas.width, yBase);
			ctx.stroke();
			ctx.closePath();

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
				path.resolve("src", "bot", "modules", "images", "assets", "classes",
					`${champion.Roles.substring(10).toLowerCase().replace(" ", "")}.png`)
			);
			ctx.drawImage(classIcon, canvas.width - 4 - fontSize, yBase + 4, fontSize, fontSize);
		}

		ctx.fillStyle = "#34495E";
		ctx.font = `16px Roboto`;
		ctx.fillText(`Page ${page || 1} of ${Math.ceil(champions.length / 3)}`, canvas.width / 2, canvas.height - 7);

		return ["", {
			file: await new Promise((resolve, reject) => canvas.toBuffer((err, buffer) => {
				if(err) reject(err);
				else resolve(buffer);
			})),
			name: "champions.png"
		}];
	},
	args: [{
		type: "int",
		label: "page",
		optional: true,
		min: 1,
		get max() { return Math.ceil(champions.length / 3); }
	}]
};

let champions;
async function updateChampions() {
	champions = await request().setEndpoint("getchampions").data(1);
}

setTimeout(updateChampions, 5000);
