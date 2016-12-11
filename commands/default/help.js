const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const commands = Oxyl.commands;

var command = new Command("help", (message, bot) => {
	let cmds = {};

	for(var cmdType in commands) {
		cmds[cmdType] = [];
		for(var cmd in commands[cmdType]) {
			cmd = commands[cmdType][cmd];
			cmds[cmdType].push(cmd.name);
			cmds[cmdType].concat(cmd.aliases);
		}
	}

	var helpMsg = "", totalAmt = 0;

	for(var loopType in cmds) {
		cmds[loopType] = cmds[loopType].sort();
		var length = Object.keys(cmds[loopType]).length;
		totalAmt += length;
		helpMsg += `${framework.capitalizeEveryFirst(loopType)} Commands **(${length}):** `;
		helpMsg += `\`${cmds[loopType].join("`**,** `")}\`\n\n`;
	}

	helpMsg += `All Commands - **${totalAmt}**`;
	helpMsg += `\nUse \`advancedhelp\` to get a advanced list of commands, or \`cmdinfo\` to get a detailed description of one`;

	return helpMsg;
}, {
	type: "default",
	aliases: ["cmds", "commands"],
	description: "List all registered commands"
});
