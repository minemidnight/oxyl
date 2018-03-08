const { createCanvas, Image, registerFont } = require("canvas");
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

const regionMap = {
	Brazil: "BR",
	Europe: "EU",
	"Latin America North": "LAN",
	"North America": "NA",
	Oceania: "OCE",
	"Southeast Asia": "SEA",
	"South America": "SA"
};

const loadedChampions = new Map();
async function generate(matchDetails) {
	const canvas = createCanvas(1025, 650);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if(matchDetails[0].Winning_TaskForce === 2) matchDetails = matchDetails.concat(matchDetails.splice(0, 5));

	ctx.fillStyle = "#34495E";
	ctx.font = "16px Roboto";
	ctx.textBaseline = "top";

	ctx.fillText(`ID: ${matchDetails[0].Match}`, 5, 5);
	let { width } = ctx.measureText(`ID: ${matchDetails[0].Match}`);

	const date = new Date(matchDetails[0].Entry_Datetime);
	ctx.fillText(`Date: ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`, 20 + width, 5);
	width += ctx.measureText(`Date: ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`).width;

	const [{ Region: region }] = matchDetails;
	ctx.fillText(`Region: ${regionMap[region] || region}`, 45 + width, 5);
	width += ctx.measureText(`Region: ${regionMap[region] || region}`).width;

	ctx.fillText(`Queue: ${matchDetails[0].name}`, 60 + width, 5);

	ctx.textAlign = "right";
	const map = `Map: ${matchDetails[0].Map_Game
		.replace(/live|ranked|practice|onslaught|tdm|team deathmatch|\(|\)/gi, "")
		.trim()}`;
	ctx.fillText(map, canvas.width - 5, 5);
	width = ctx.measureText(map).width;

	const score = `Score: 4 - ${matchDetails[5][`Team${matchDetails[5].TaskForce}Score`]}`;
	ctx.fillText(score, canvas.width - width - 15, 5);
	width += ctx.measureText(score).width;

	let time = matchDetails[0].Time_In_Match_Seconds;
	time = `Duration: ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")}`;
	ctx.fillText(time, canvas.width - width - 30, 5);

	ctx.lineWidth = 15;
	ctx.beginPath();
	ctx.moveTo(0, 50);
	ctx.lineTo(0, 50 + ((canvas.height - 50) / 2));
	ctx.strokeStyle = "#3c763d";
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, 50 + ((canvas.height - 50) / 2));
	ctx.lineTo(0, canvas.height);
	ctx.strokeStyle = "#a94442";
	ctx.stroke();

	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, 50);
	ctx.lineTo(canvas.width, 50);
	ctx.strokeStyle = "#000000";
	ctx.stroke();

	ctx.font = "bold 16px Roboto";
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	ctx.fillText("PLAYER", 112.5, 50);
	ctx.fillText("CREDITS", 275, 50);
	ctx.fillText("K / D / A", 375, 50);
	ctx.fillText("STREAK", 475, 50);
	ctx.fillText("DMG DELT", 575, 50);
	ctx.fillText("DMG TAKEN", 675, 50);
	ctx.fillText("OBJ TIME", 775, 50);
	ctx.fillText("SHIELDING", 875, 50);
	ctx.fillText("HEALING", 975, 50);

	const sectionHeight = (canvas.height - 50) / 10;
	const parties = {};
	for(let i = 0; i < 10; i++) {
		const player = matchDetails[i];

		const champion = player.Reference_Name.toLowerCase().replace("'", "").replace(" ", "-");
		const championIcon = new Image();
		if(loadedChampions.has(champion)) {
			championIcon.src = loadedChampions.get(champion);
		} else {
			const { body: buffer } = await superagent.get(`https://web2.hirez.com/paladins/champion-icons/${champion}.jpg`);
			championIcon.src = buffer;
			loadedChampions.set(champion, buffer);
		}
		ctx.drawImage(championIcon, 12.5, 55 + (sectionHeight * i), sectionHeight - 10, sectionHeight - 10);

		ctx.beginPath();
		ctx.moveTo(7.5, 50 + (sectionHeight * i));
		ctx.lineTo(canvas.width, 50 + (sectionHeight * i));
		ctx.stroke();

		if(player.PartyId) {
			ctx.font = "16px Roboto";
			ctx.fillStyle = "green";
			ctx.textAlign = "right";
			ctx.textBaseline = "bottom";

			if(!parties[player.PartyId]) parties[player.PartyId] = Object.keys(parties).length + 1;
			ctx.fillText(`P${parties[player.PartyId]}`, 225, 50 + (sectionHeight * (i + 1)), 225);
		}

		ctx.fillStyle = "#34495E";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.font = "24px Roboto";
		ctx.fillText(player.playerName, sectionHeight + 5, 50 + (sectionHeight * i), 225);

		ctx.textBaseline = "bottom";
		ctx.font = "20px Roboto";
		ctx.fillText(ranks[player.League_Tier], sectionHeight + 5, 50 + (sectionHeight * (i + 1)), 225);

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const yCoord = 50 + (sectionHeight * i) + (sectionHeight / 2);
		ctx.fillText(player.Gold_Earned.toLocaleString(), 275, yCoord);
		ctx.fillText(`${player.Kills_Player} / ${player.Deaths} / ${player.Assists}`, 375, yCoord);
		ctx.fillText(player.Killing_Spree, 475, yCoord);
		ctx.fillText(player.Damage_Player.toLocaleString(), 575, yCoord);
		ctx.fillText(player.Damage_Taken.toLocaleString(), 675, yCoord);
		ctx.fillText(player.Objective_Assists, 775, yCoord);
		ctx.fillText(player.Damage_Mitigated.toLocaleString(), 875, yCoord);
		ctx.fillText(player.Healing.toLocaleString(), 975, yCoord);
	}

	process.stdout.write(canvas.toDataURL());
}

generate(JSON.parse(process.env.MATCHDETAILS));
