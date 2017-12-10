const { createCanvas, Image, loadImage, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });

const abilityMap = {
	1: "Primary",
	2: "Alt-Fire",
	3: "Q",
	4: "F",
	5: "E"
};

async function generate(champion, legendaries) {
	const canvas = createCanvas(600, 650);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const { body: championBuffer } = await superagent.get(champion.ChampionIcon_URL);
	const championIcon = new Image();
	championIcon.src = championBuffer;

	ctx.drawImage(championIcon, 5, 5, 150, 150);

	ctx.fillStyle = "#34495E";
	ctx.font = "16px Roboto";
	ctx.textAlign = "center";
	ctx.fillText(`Health: ${champion.Health}`, 77.5, 175);
	ctx.fillText(`Speed: ${champion.Speed}`, 77.5, 200);

	const classIcon = await loadImage(path.resolve(__dirname, "assets", "classes",
		`${champion.Roles.substring(10).toLowerCase().replace(" ", "")}.png`)
	);
	ctx.drawImage(classIcon, 52.5, 210, 50, 50);

	ctx.textBaseline = "top";
	ctx.textAlign = "left";
	for(let i = 0; i < 5; i++) {
		const ability = champion[`Ability_${i + 1}`];
		const { body: abilityBuffer } = await superagent.get(ability.URL);
		const abilityIcon = new Image();
		abilityIcon.src = abilityBuffer;

		ctx.drawImage(abilityIcon, 160, (i * 80) + 5, 75, 75);
		ctx.font = "16px Roboto";
		ctx.fillText(`${ability.Summary} (${abilityMap[i + 1]})`, 240, (i * 80) + 2.5);


		ctx.font = `12px Roboto`;
		let description = ability.Description.replace(/\r/g, " ").split(/\n| /), lineNumber = 0;
		while(description.length) {
			const line = description.slice();
			while(ctx.measureText(line.join(" ")).width > canvas.width - 245) line.splice(-1);

			ctx.fillText(line.join(" "), 240, (i * 80) + (lineNumber * 14) + 20);
			lineNumber++;
			description = description.slice(line.length);
		}
	}

	ctx.textAlign = "center";
	ctx.fillStyle = "#FFFFFF";
	for(let i = 0; i < legendaries.length; i++) {
		const legendary = legendaries[i];
		const { body: legendaryBuffer } = await superagent.get(legendary.itemIcon_URL);
		const legendaryIcon = new Image();
		legendaryIcon.src = legendaryBuffer;

		ctx.font = `12px Roboto`;
		ctx.drawImage(legendaryIcon, 25 + (i * 200), 400, 150, 513 / (319 / 150));
		ctx.fillText(legendary.DeviceName, 100 + (i * 200), 511.5);

		let description = legendary.Description.split(" "), lineNumber = 0;
		ctx.font = `10px Roboto`;
		const closingIndex = description.findIndex(ele => ~ele.indexOf("]"));
		ctx.fillText(description.splice(0, closingIndex + 1).join(" ").slice(1, -1), 100 + (i * 200), 527.5);

		ctx.font = `9px Roboto`;
		while(description.length) {
			const line = description.slice();
			while(ctx.measureText(line.join(" ")).width > 105) line.splice(-1);

			ctx.fillText(line.join(" "), 100 + (i * 200), 542.5 + (lineNumber * 10));
			lineNumber++;
			description = description.slice(line.length);
		}
	}

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.CHAMPION), JSON.parse(process.env.LEGENDARIES));
