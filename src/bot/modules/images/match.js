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
async function generate({ bans, matchDetails, player: specificPlayer }) {
	if(specificPlayer) {
		specificPlayer = matchDetails.find(({ playerName }) => playerName.toLowerCase() === specificPlayer) ||
			matchDetails.find(({ playerName }) => playerName.toLowerCase().startsWith(specificPlayer));
	}

	const canvas = createCanvas(1025, 650 + (specificPlayer ? 115 : 0) + (bans ? 100 : 0));
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#F2F3F4";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

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
		.replace(/live|ranked|practice|onslaught|tdm|team deathmatch|\(|\)|ascended assault/gi, "")
		.trim()}`;
	ctx.fillText(map, canvas.width - 5, 5);
	width = ctx.measureText(map).width;

	const score = `Score: ${matchDetails[0].Team1Score} - ${matchDetails[0].Team2Score}`;
	ctx.fillText(score, canvas.width - width - 15, 5);
	width += ctx.measureText(score).width;

	let time = matchDetails[0].Time_In_Match_Seconds;
	time = `Duration: ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")}`;
	ctx.fillText(time, canvas.width - width - 30, 5);

	const sectionHeight = (canvas.height - 50 - (specificPlayer ? 115 : 0) - (bans ? 100 : 0)) / 10;
	const midLine = ((canvas.height - 50) / 2) +
		(specificPlayer ? specificPlayer.Win_Status === "Winner" ? 115 - sectionHeight : -sectionHeight : 0);

	ctx.lineWidth = 15;
	ctx.beginPath();
	ctx.moveTo(0, 50);
	ctx.lineTo(0, midLine);
	ctx.strokeStyle = "#3c763d";
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, midLine);
	ctx.lineTo(0, canvas.height - (bans ? 100 : 0));
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

	const parties = {};
	let toAdd = 0;
	for(let i = 0; i < 10; i++) {
		const player = matchDetails[i];

		const champion = player.Reference_Name.replace(/([A-Za-z]+)([A-Z][^a])/, "$1 $2")
			.toLowerCase()
			.replace("'", "")
			.replace(" ", "-");

		const championIcon = new Image();
		if(loadedChampions.has(champion)) {
			championIcon.src = loadedChampions.get(champion);
		} else {
			const { body: buffer } = await superagent.get(`https://web2.hirez.com/paladins/champion-icons/${champion}.jpg`);
			championIcon.src = buffer;
			loadedChampions.set(champion, buffer);
		}
		ctx.drawImage(championIcon, 12.5, 55 + (sectionHeight * i) + toAdd, sectionHeight - 10, sectionHeight - 10);

		ctx.beginPath();
		ctx.moveTo(7.5, 50 + (sectionHeight * i) + toAdd);
		ctx.lineTo(canvas.width, 50 + (sectionHeight * i) + toAdd);
		ctx.stroke();

		if(player.PartyId) {
			ctx.font = "16px Roboto";
			ctx.fillStyle = "green";
			ctx.textAlign = "right";
			ctx.textBaseline = "bottom";

			if(!parties[player.PartyId]) parties[player.PartyId] = Object.keys(parties).length + 1;
			ctx.fillText(`P${parties[player.PartyId]}`, 225, 50 + (sectionHeight * (i + 1)) + toAdd, 225);
		}

		ctx.fillStyle = "#34495E";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.font = "24px Roboto";
		ctx.fillText(player.playerName, sectionHeight + 5, 50 + (sectionHeight * i) + toAdd, 225);

		ctx.textBaseline = "bottom";
		ctx.font = "20px Roboto";
		ctx.fillText(ranks[player.League_Tier], sectionHeight + 5, 50 + (sectionHeight * (i + 1)) + toAdd, 225);

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const yCoord = 50 + (sectionHeight * i) + (sectionHeight / 2) + toAdd;
		ctx.fillText(player.Gold_Earned.toLocaleString(), 275, yCoord);
		ctx.fillText(`${player.Kills_Player} / ${player.Deaths} / ${player.Assists}`, 375, yCoord);
		ctx.fillText(player.Killing_Spree, 475, yCoord);
		ctx.fillText(player.Damage_Player.toLocaleString(), 575, yCoord);
		ctx.fillText(player.Damage_Taken.toLocaleString(), 675, yCoord);
		ctx.fillText(player.Objective_Assists, 775, yCoord);
		ctx.fillText(player.Damage_Mitigated.toLocaleString(), 875, yCoord);
		ctx.fillText(player.Healing.toLocaleString(), 975, yCoord);

		if(!toAdd && specificPlayer && player.playerName === specificPlayer.playerName) {
			ctx.textBaseline = "top";

			ctx.fillText(player.talent.DeviceName, 300, (sectionHeight * i) + 110);
			const talentIcon = new Image();
			const { body: buffer } = await superagent
				.get(`http://web2.hirez.com/paladins/community/Legendary-Card-PNGs/${player.talent.ItemId}.png`);
			talentIcon.src = buffer;
			ctx.drawImage(talentIcon, 250, (sectionHeight * i) + 125, 100, 100);

			for(let itemCount = 0; itemCount < player.items.length; itemCount++) {
				const item = player.items[itemCount];

				const itemIcon = new Image();
				const { body: itemBuffer } = await superagent.get(item.itemIcon_URL);
				itemIcon.src = itemBuffer;
				ctx.drawImage(itemIcon, 15 + (itemCount * 55), (sectionHeight * i) + 125, 50, 50);

				ctx.fillStyle = "black";
				for(let level = 0; level < item.level; level++) {
					ctx.fillRect(15 + (itemCount * 55) + (level * (50 / 3)), (sectionHeight * i) + 177.5, 15, 5);
				}
				ctx.fillStyle = "#F2F3F4";
			}

			toAdd = 115;
		}
	}

	if(bans) {
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "bold 48px Roboto";
		ctx.fillText("BANS", canvas.width / 2, canvas.height - 80 + 37.5);

		for(let i = 0; i < bans.length; i++) {
			const banImage = bans[i];

			let xCoord;
			if(i <= 1) xCoord = canvas.width * 0.3;
			else xCoord = canvas.width * 0.7;
			xCoord -= 37.5;

			const championIcon = new Image();
			const { body: championBuffer } = await superagent.get(banImage);
			championIcon.src = championBuffer;
			ctx.drawImage(championIcon, xCoord + (i % 2 ? 40 : -40), canvas.height - 80, 75, 75);
		}
	}

	process.stdout.write(canvas.toDataURL());
}

process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
	const chunk = process.stdin.read();
	if(!chunk) return;

	generate(JSON.parse(chunk.trim()));
	process.stdin.destroy();
});
