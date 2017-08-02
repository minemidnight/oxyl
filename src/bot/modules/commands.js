const argHandler = require("./args.js");
const handleCensor = require("./censors.js");

module.exports = async message => {
	const guild = message.channel.guild;

	if(~message.content.indexOf("&&") && !~message.content.indexOf("exec")) {
		let commands = message.content.split("&&");
		for(let command of commands) {
			message.content = command.trim();
			let result = await module.exports(message);
			if(!result) break;
		}

		return false;
	}

	let prefix = `^(?:${bot.config.bot.prefixes.join("|")}),?(?:\\s+)?([\\s\\S]+)`;
	if(guild && bot.prefixes.has(guild.id)) {
		let insertIndex = prefix.indexOf("),?(");
		let guildPrefix = `|${bot.utils.escapeRegex(bot.prefixes.get(guild.id))}`;
		prefix = prefix.substring(0, insertIndex) + guildPrefix + prefix.substring(insertIndex);
	}
	prefix = new RegExp(prefix, "i");

	let match = message.content.match(prefix);
	if(!match && guild) {
		handleCensor(message);
		return false;
	} else if(match) {
		message.content = match[1];
	}

	let command;
	if(!~message.content.indexOf(" ")) {
		command = message.content;
		message.content = "";
	} else {
		command = message.content.substring(0, message.content.indexOf(" "));
		message.content = message.content.substring(message.content.indexOf(" "));
	}
	command = command.toLowerCase().trim();

	command = Object.keys(bot.commands)
		.map(key => bot.commands[key])
		.find(cmd => command === cmd.name || ~cmd.aliases.indexOf(command));
	if(!command) return false;
	else if(!command.caseSensitive) message.content = message.content.toLowerCase();
	statsd({ type: "increment", stat: "commands" });

	let editedInfo = {};
	if(guild) {
		editedInfo = await r.table("editedCommands").get([command.name, message.channel.guild.id]).run() || {};
	}

	if(editedInfo.enabled === false) {
		return false;
	} else if((command.guildOnly || command.perm || command.type === "admin") && !guild) {
		message.channel.createMessage(__("modules.commands.guildOnly", message));
		return false;
	} else if(command.type === "creator" && !~bot.config.bot.creators.indexOf(message.author.id)) {
		message.channel.createMessage(__("modules.commands.creatorOnly", message));
		return false;
	} else if(command.type === "admin" && !editedInfo.roles &&
						!(message.member.permission.has("administrator") || message.author.id === guild.ownerID)) {
		message.channel.createMessage(__("modules.commands.adminOnly", message));
		return false;
	} else if(command.perm && !editedInfo.roles &&
						!(message.member.permission.has(command.perm) || message.author.id === guild.ownerID)) {
		message.channel.createMessage(__("modules.commands.noPerms", message, { perm: command.perm }));
		return false;
	} else if(editedInfo.roles && !editedInfo.roles.some(roleID => ~message.member.roles.indexOf(roleID))) {
		let roleNames = editedInfo.roles.map(roleID => guild.roles.has(roleID) ? guild.roles.get(roleID).name : roleID);
		message.channel.createMessage(__("modules.commands.noRoles", message, { roles: `\`${roleNames.join("`, `")}\`` }));
		return false;
	}

	message.command = command;
	let args = message.args = await argHandler(message, command);
	if(typeof args === "string") {
		message.channel.createMessage(args);
		return false;
	}

	try {
		await message.channel.sendTyping();
		let result = await command.run(message);

		let output = { content: "" }, file;
		if(Array.isArray(result)) {
			output.content = result[0];
			file = result[1];
		} else if(typeof result === "object") {
			output = result;
		} else if(result) {
			output.content = result.toString();
		} else {
			output = false;
		}

		if(output) {
			if(output.content) output.content = output.content.substring(0, 2000);
			await message.channel.createMessage(output, file);
		}

		if(command.name === "play") return new Promise(resolve => setTimeout(() => resolve(true), 750));
		else return true;
	} catch(err) {
		try {
			let resp = JSON.parse(err.response);
			let permCodes = [50013, 10008, 50001, 40005, 10003];
			if(~permCodes.indexOf(resp.code)) {
				message.channel.createMessage(__("modules.commands.permissionFail", message));
			} else {
				throw err;
			}
		} catch(error) {
			message.channel.createMessage(__("modules.commands.errorRunning", message,
				{ stack: bot.utils.codeBlock(err.stack) }));
		}

		return false;
	}
};
