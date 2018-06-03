const { createCanvas, Image, registerFont } = require("canvas");
const path = require("path");
const superagent = require("superagent");

registerFont(path.resolve(__dirname, "assets", "Roboto.ttf"), { family: "Roboto" });

const regionMap = {
	Brazil: "BR",
	Europe: "EU",
	"Latin America North": "LAN",
	"North America": "NA",
	Oceania: "OCE",
	"Southeast Asia": "SEA",
	"South America": "SA"
};

const mapNamesToIcons = {
	"ascension-peak": "AscensionPeak",
	"asiatic-map": "AscensionPeak",
	"frozen-guard": "NRIgloo",
	"frog-isle": "Isle",
	"fish-market": "Village",
	"jaguar-falls": "Temple",
	"timber-mill": "Spiral",
	"splitstone-quarry": "Quarry",
	"ice-mines": "NRMines",
	"stone-keep": "Castle",
	"serpent-beach": "Beach",
	brightmarsh: "Atrium",
	"primal-court": "TropicalArena",
	"trade-district": "TradeDistrict",
	"foremans-rise": "Quarry_Onslaught",
	"magistrates-archives": "Archives",
	"snowfall-junction": "IceArena",
	"wip-bg": "TestMaps"
};

const loadedChampions = new Map();
const loadedMaps = new Map();
async function generate({ page, totalPages, matchHistory }) {
	const canvas = createCanvas(900, (matchHistory.length * 200) + 25);
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

		const champion = match.Champion.toLowerCase().replace("'", "").replace(" ", "-");
		const championIcon = new Image();
		if(loadedChampions.has(champion)) {
			championIcon.src = loadedChampions.get(champion);
		} else {
			const { body: buffer } = await superagent.get(`https://web2.hirez.com/paladins/champion-icons/${champion}.jpg`);
			championIcon.src = buffer;
			loadedChampions.set(champion, buffer);
		}
		ctx.drawImage(championIcon, 12.5, yBase + 12.5, 175, 175);

		ctx.textAlign = "left";
		ctx.fillStyle = "#34495E";
		ctx.font = "39px Roboto";
		ctx.fillText(`as ${match.Champion}`, 200, yBase + 187.5);

		ctx.textAlign = "right";
		ctx.font = "20px Roboto";
		ctx.fillText(`ID: ${match.Match}`, 895, yBase + 187.5);

		let { width: removeX } = ctx.measureText(`ID: ${match.Match}`);
		const date = new Date(match.Match_Time);
		ctx.fillText(`Date: ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`, 885 - removeX, yBase + 187.75);
		removeX += ctx.measureText(`Date: ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`).width;
		ctx.fillText(`Queue: ${match.Queue}`, 875 - removeX, yBase + 187.75);

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
		ctx.fillText("REGION", 650, yBase + 76.5);
		ctx.fillText("OBJ TIME", 750, yBase + 26.5);
		ctx.fillText("SHEILDING", 850, yBase + 26.5);

		ctx.font = "18px Roboto";
		ctx.fillText("SCORE", 350, yBase + 128);
		ctx.fillText("TIME", 550, yBase + 128);

		ctx.font = "26px Roboto";
		if(match.TaskForce === 2) {
			const teamOneScore = match.Team1Score;
			match.Team1Score = match.Team2Score;
			match.Team2Score = teamOneScore;
		}

		ctx.fillText(`${match.Team1Score} - ${match.Team2Score}`, 350, yBase + 154);
		const time = match.Time_In_Match_Seconds;
		ctx.fillText(`${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")}`, 550, yBase + 154);

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
		ctx.fillText(regionMap[match.Region] || match.Region, 650, yBase + 100);
		ctx.fillText(match.Objective_Assists.toLocaleString(), 750, yBase + 50);
		ctx.fillText(match.Damage_Mitigated.toLocaleString(), 850, yBase + 50);

		const map = match.Map_Game
			.toLowerCase()
			.replace(/^(live|ranked|practice)|'|onslaught|tdm|team deathmatch|\(|\)|ascended assault/g, "")
			.trim()
			.replace(/\s+/g, "-");

		const mapIcon = new Image();
		if(loadedMaps.has(map)) {
			mapIcon.src = loadedMaps.get(map);
		} else {
			const { body: buffer } = await superagent.get(`https://web2.hirez.com/paladins/community/Maps/` +
				`Loading_${mapNamesToIcons[map]}.jpg`);
			mapIcon.src = buffer;
			loadedMaps.set(map, buffer);
		}


		ctx.drawImage(mapIcon, 710, yBase + 62.5, 180, 101.25);
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
