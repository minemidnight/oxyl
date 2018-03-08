const { createCanvas, Image, loadImage, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });
registerFont(path.resolve(__dirname, "assets", "Roboto-Bold.ttf"), { family: "Roboto", weight: "bold" });

const abilityMap = {
	1: "Primary",
	2: "Alt-Fire",
	3: "Q",
	4: "F",
	5: "E"
};

async function generate(champion, legendaries) {
	const canvas = createCanvas(700, 410 + (legendaries.length * 80));
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const { body: championBuffer } = await superagent.get(champion.ChampionIcon_URL);
	const championIcon = new Image();
	championIcon.src = championBuffer;

	ctx.drawImage(championIcon, 5, 5, 150, 150);

	ctx.fillStyle = "#34495E";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";

	let fontSize = 30;
	do {
		ctx.font = `bold ${fontSize}px Roboto`;
		fontSize--;
	} while(ctx.measureText(champion.Title).width > 150);
	ctx.fillText(champion.Title, 77.5, 160);

	ctx.font = "16px Roboto";
	ctx.fillText(`Health: ${champion.Health}`, 77.5, 170 + fontSize);
	ctx.fillText(`Speed: ${champion.Speed}`, 77.5, 190 + fontSize);

	const classIcon = await loadImage(path.resolve(__dirname, "assets", "classes",
		`${champion.Roles.substring(9).toLowerCase().replace(" ", "")}.png`)
	);
	ctx.drawImage(classIcon, 40, 250 + fontSize, 75, 75);

	ctx.textAlign = "left";
	for(let i = 0; i < 5; i++) {
		const ability = champion[`Ability_${i + 1}`];
		const { body: abilityBuffer } = await superagent.get(ability.URL);
		const abilityIcon = new Image();
		abilityIcon.src = abilityBuffer;

		ctx.drawImage(abilityIcon, 160, (i * 80) + 5, 75, 75);
		ctx.font = "18px Roboto";
		ctx.fillText(`${ability.Summary} (${abilityMap[i + 1]})`, 240, (i * 80) + 2.5);

		ctx.font = "14px Roboto";
		let description = ability.Description.replace(/\r/g, " ").split(/\n| /), lineNumber = 0;
		while(description.length) {
			const line = description.slice();
			while(ctx.measureText(line.join(" ")).width > canvas.width - 245) line.splice(-1);

			ctx.fillText(line.join(" "), 240, (i * 80) + (lineNumber * 14) + 24);
			lineNumber++;
			description = description.slice(line.length);
		}
	}

	for(let i = 0; i < legendaries.length; i++) {
		const legendary = legendaries[i];
		const { body: legendaryBuffer } = await superagent.get(`http://web2.hirez.com/paladins/community/` +
			`Legendary-Card-PNGs/${legendary.ItemId}.png`);
		const legendaryIcon = new Image();
		legendaryIcon.src = legendaryBuffer;

		ctx.drawImage(legendaryIcon, 160, (i * 80) + 405, 75, 75);
		ctx.font = "18px Roboto";
		ctx.fillText(`${legendary.DeviceName}`, 240, (i * 80) + 402.5);

		ctx.font = "14px Roboto";
		let description = legendary.Description.split(" "), lineNumber = 0;
		while(description.length) {
			const line = description.slice();
			while(ctx.measureText(line.join(" ")).width > canvas.width - 245) line.splice(-1);

			ctx.fillText(line.join(" "), 240, (i * 80) + (lineNumber * 14) + 424);
			lineNumber++;
			description = description.slice(line.length);
		}
	}

	process.stdout.write(canvas.toDataURL());
}
process.on("unhandledRejection", err => console.error(err.stack));

generate(JSON.parse(process.env.CHAMPION), JSON.parse(process.env.LEGENDARIES));
