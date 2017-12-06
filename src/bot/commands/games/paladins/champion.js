const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");
const { request } = require("../../../modules/PaladinsAPI");

registerFont(path.resolve("src", "bot", "assets", "Roboto.ttf"), { family: "Roboto" });

module.exports = {
	async run({ args: [search], t, wiggle }) {
		delete require.cache[require.resolve("./champion")];
		wiggle.categories.get("games").subcommands.get("paladins")
			.commands.get("champion").process = require("./champion").run;

		const champion = champions.find(champ => champ.Name.toLowerCase().startsWith(search));
		if(!champion) return t("commands.paladins.champion.invalidChampion");

		const canvas = createCanvas(600, 250);
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "#F2F3F4";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const championIcon = await loadImage(
			path.resolve("src", "bot", "assets", "champions", `${champion.Name.toLowerCase()}.png`)
		);

		ctx.drawImage(championIcon, 5, 5, 150, 150);

		ctx.fillStyle = "#34495E";
		ctx.font = `16px Roboto`;
		ctx.fillText(`Health: ${champion.Health}`, 5, 175);
		ctx.fillText(`Speed: ${champion.Speed}`, 5, 200);

		return ["", {
			file: await new Promise((resolve, reject) => canvas.toBuffer((err, buffer) => {
				if(err) reject(err);
				else resolve(buffer);
			})),
			name: "player.png"
		}];
	},
	args: [{
		type: "text",
		label: "champion"
	}]
};

let champions;
async function updateChampions() {
	champions = await request().setEndpoint("getchampions").data(1);
}

setTimeout(updateChampions, 5000);
