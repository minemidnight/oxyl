const { createCanvas, Image, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });
registerFont(path.resolve(__dirname, "assets", "Roboto-Bold.ttf"), { family: "Roboto", weight: "bold" });

async function generate(pageData, matchHistory) {
	const canvas = createCanvas(900, matchHistory.length * 200);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for(let i = 0; i < matchHistory.length; i++) {
		const match = matchHistory[i];
		const yBase = i * 200;

		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, yBase + 200);
		ctx.lineTo(canvas.width, yBase + 200);
		ctx.stroke();

		const { body: championBuffer } = await superagent.get(`https://web2.hirez.com/paladins/champion-icons/` +
			`${match.Champion.toLowerCase().replace(" ", "-")}.jpg`);
		const championIcon = new Image();
		championIcon.src = championBuffer;
		ctx.drawImage(championIcon, 12.5, yBase + 12.5, 175, 175);

		ctx.textAlign = "left";
		ctx.fillStyle = "#34495E";
		ctx.font = "36px Roboto";
		ctx.fillText(`as ${match.Champion}`, 200, yBase + 187.5);

		ctx.textAlign = "right";
		ctx.font = "20px Roboto";
		ctx.fillText(`ID: ${match.Match}`, 895, yBase + 187.5);

		ctx.beginPath();
		ctx.strokeStyle = match.Win_Status === "Win" ? "#3c763d" : "#a94442";
		ctx.lineWidth = 7.5;
		ctx.rect(12.5, yBase + 12.5, 175, 175);
		ctx.stroke();

		ctx.textAlign = "center";
		ctx.font = "14px Roboto";
		ctx.fillText("KDA", 250, yBase + 26.5);
		ctx.fillText("KILLSTREAK", 250, yBase + 76.5);
		ctx.fillText("CREDITS", 350, yBase + 26.5);
		ctx.fillText("MULTIKILL", 350, yBase + 76.5);
		ctx.fillText("HEALING", 450, yBase + 26.5);
		ctx.fillText("SELF HEALING", 450, yBase + 76.5);
		ctx.fillText("DMG DELT", 550, yBase + 26.5);
		ctx.fillText("WPN DMG", 550, yBase + 76.5);
		ctx.fillText("DMG TAKEN", 650, yBase + 26.5);
		ctx.fillText("OBJ TIME", 750, yBase + 26.5);
		ctx.fillText("SHEILDING", 850, yBase + 26.5);

		ctx.font = "24px Roboto";
		ctx.fillStyle = "#a94442";
		ctx.fillText(match.Deaths, 250, yBase + 50);

		ctx.fillStyle = "#34495E";
		let { width } = ctx.measureText(match.Deaths);
		ctx.fillText("/", 250 + width, yBase + 50);
		ctx.fillText("/", 250 - width, yBase + 50);

		width += ctx.measureText("/").width;
		ctx.textAlign = "right";
		ctx.fillStyle = "#3c763d";
		ctx.fillText(match.Kills, 250 - width, yBase + 50);
		ctx.textAlign = "left";
		ctx.fillStyle = "#8a6d3b";
		ctx.fillText(match.Assists, 250 + width, yBase + 50);

		ctx.textAlign = "center";
		ctx.fillStyle = "#34495E";
		ctx.fillText(match.Killing_Spree.toLocaleString(), 250, yBase + 100);
		ctx.fillText(match.Gold.toLocaleString(), 350, yBase + 50);
		ctx.fillText(match.Multi_kill_Max.toLocaleString(), 350, yBase + 100);
		ctx.fillText(match.Healing.toLocaleString(), 450, yBase + 50);
		ctx.fillText(match.Healing_Player_Self.toLocaleString(), 450, yBase + 100);
		ctx.fillText(match.Damage.toLocaleString(), 550, yBase + 50);
		ctx.fillText(match.Damage_Done_In_Hand.toLocaleString(), 550, yBase + 100);
		ctx.fillText(match.Damage_Taken.toLocaleString(), 650, yBase + 50);
		ctx.fillText(match.Objective_Assists.toLocaleString(), 750, yBase + 50);
		ctx.fillText(match.Damage_Mitigated.toLocaleString(), 850, yBase + 50);
	}

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.PAGEDATA), JSON.parse(process.env.MATCHHISTORY));
