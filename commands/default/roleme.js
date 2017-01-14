const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("roleme", async (message, bot) => {
	let eslintfix;
	return "Unfinished command";
}, {
	guildOnly: true,
	type: "default",
	description: "Receive a role (must be allowed by mods)",
	args: [{
		type: "text",
		label: "role name"
	}]
});
