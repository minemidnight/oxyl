const path = require("path"),
	fs = require("fs");
module.exports = {
	process: async message => {
		let scriptPath = `${path.resolve(...["src"].concat(message.args[0].split("/")))}.js`;
		let scriptName = scriptPath.substring(scriptPath.lastIndexOf("/") + 1, scriptPath.length - 3);
		let exists = fs.existsSync(scriptPath);
		if(!exists) return "Invalid file path! File not found";

		if(~scriptPath.indexOf("/listeners/")) {
			await process.output({
				type: "globalEval",
				input: `if(require.cache["${scriptPath}"]) bot.removeListener("${scriptName}", require("${scriptPath}"));` +
					`delete require.cache["${scriptPath}"];` +
					`if(~"${scriptPath}".indexOf("/once/")) bot.once("${scriptName}", require("${scriptPath}"));` +
					`else bot.on("${scriptName}", require("${scriptPath}"));`
			});

			return `Successfully reloaded listener \`${scriptName}\``;
		} else if(~scriptPath.indexOf("/utils/")) {
			await process.output({
				type: "globalEval",
				input: `delete bot.utils["${scriptName}"];` +
					`delete require.cache["${scriptPath}"];` +
					`bot.utils["${scriptName}"] = require("${scriptPath}");`
			});

			return `Successfully reloaded util \`${scriptName}\``;
		} else if(~scriptPath.indexOf("/commands/")) {
			let scriptType = scriptPath.substring(scriptPath.indexOf("/commands/") + 10, scriptPath.lastIndexOf("/"));
			await process.output({
				type: "globalEval",
				input: `delete bot.commands["${scriptName}".toLowerCase()];` +
					`delete require.cache["${scriptPath}"];` +
					`let scriptData = require("${scriptPath}");` +
					`scriptData.name = "${scriptName}";` +
					`scriptData.type = "${scriptType}";` +
					`const Command = require("./structures/command.js");` +
					`let command = new Command(scriptData);`
			});

			return `Successfully reloaded command \`${scriptName.toLowerCase()}\``;
		} else {
			await process.output({
				type: "globalEval",
				input: `delete require.cache["${scriptPath}"]`
			});

			return `Successfully reloaded \`${scriptName}\``;
		}
	},
	caseSensitive: true,
	description: "Reload a file globally",
	args: [{
		type: "text",
		label: "folder/file"
	}]
};
