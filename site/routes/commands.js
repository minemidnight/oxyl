const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js"),
	handlebars = require("handlebars");
const router = express.Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	let data = { commands: {} }, commands = Oxyl.commands;
	for(let cmdType in commands) {
		data.commands[cmdType] = [];
		for(let cmd in commands[cmdType]) {
			cmd = commands[cmdType][cmd];
			data.commands[cmdType].push({
				name: `${cmd.name} ${cmd.usage !== "[]" ? main.escapeHTML(cmd.usage) : ""}`,
				description: cmd.description,
				aliases: cmd.aliases.length > 0 ? cmd.aliases.join(", ") : "N/A"
			});
		}
	}

	res.send(await main.parseHB("commands", req, data));
	res.end();
});

handlebars.registerHelper("listcmds", (commands) => {
	let returnstr = "";
	for(let cmdType in commands) {
		returnstr += `<div class="w3-accordion">`;
		returnstr += `<button onclick="toggleAccordion(this)" class="w3-section w3-blue-grey w3-btn-block w3-left-align">` +
									`${framework.capitalizeEveryFirst(cmdType)} Commands</button>`;
		returnstr += `<div class="w3-accordion-content w3-responsive w3-animate-zoom">`;
		returnstr += `<table class="w3-table w3-bordered w3-hoverable">`;
		returnstr += `<tr class="w3-hover-notquiteblack"><th>Usage</th><th>Description</th><th>Aliases</th></tr>`;

		for(let cmd in commands[cmdType]) {
			cmd = commands[cmdType][cmd];
			returnstr += `<tr class="w3-hover-notquiteblack"><td>${cmd.name}</td><td>${cmd.description}</td><td>${cmd.aliases}</td></tr>`;
		}
		returnstr += `</table></div></div>`;
	}

	returnstr += `<div class="w3-accordion">`;
	returnstr += `<button onclick="toggleAccordion(this)" class="w3-section w3-blue-grey w3-btn-block w3-left-align">Command Usage</button>`;
	returnstr += `<div class="w3-accordion-content w3-responsive w3-animate-zoom">`;
	returnstr += `<table class="w3-table w3-bordered w3-hoverable">`;
	returnstr += `<tr class="w3-hover-notquiteblack"><th>Command</th><th>Uses</th></tr>`;

	let cmds = [];
	for(let i in Oxyl.commands)	{
		for(let i2 in Oxyl.commands[i]) {
			cmds.push(Oxyl.commands[i][i2]);
		}
	}
	returnstr += cmds.sort((a, b) => b.uses - a.uses)
			.map(cmd => `<tr class="w3-hover-notquiteblack"><td>${cmd.name}</td><td>${cmd.uses}</td></tr>`)
			.join("");
	returnstr += `</table></div></div>`;

	return new handlebars.SafeString(returnstr);
});

module.exports = router;
