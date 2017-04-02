const argHandler = require("./args.js");
module.exports = async message => {
	const guild = message.channel.guild;
	let prefix = `^(?:ob!|oxylb|<@!?${bot.user.id}>|{GPRE}),?(?:\\s+)?([\\s\\S]+)`;
	if(guild && bot.prefixes.has(guild.id)) {
		prefix = prefix.replace("{GPRE}", `|${bot.utils.escapeRegex(bot.prefixes.get(guild.id))}`);
	}
	prefix = new RegExp(prefix, "i");

	let match = message.content.match(prefix);
	if(!match) return;
	message.content = match[1];

	let command;
	if(!~message.content.indexOf(" ")) {
		command = message.content;
		message.content = "";
	} else {
		command = message.content.substring(0, message.content.indexOf(" "));
		message.content = message.content.substring(message.content.indexOf(" "));
	}
	command = command.toLowerCase().trim();

	command = bot.commands.find(cmd => command === cmd.name || ~cmd.aliases.indexOf(command));
	if(!command) return;
	else if(!command.caseSensitive) message.content = message.content.toLowerCase();


	if((command.guildOnly || command.perm || command.type === "admin") && !guild) {
		message.channel.createMessage("Sorry, but this command is for guilds (servers) only.");
		return;
	} else if(command.type === "creator" && !~bot.publicConfig.creators.indexOf(message.author.id)) {
		message.channel.createMessage("This command can only be used by the creators of the bot.");
		return;
	} else if(command.perm && !message.member.permission.has(command.perm)) {
		message.channel.createMessage(`You cannot run this command, it requires the permission ${command.perm}.`);
		return;
	}

	message.command = command;
	let args = message.args = await argHandler(message, command);
	if(typeof args === "string") {
		message.channel.createMessage(args);
		return;
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
	} catch(err) {
		try {
			let resp = JSON.parse(err.response);
			let permCodes = [50013, 10008, 50001, 40005, 10003];
			if(~permCodes.indexOf(resp.code)) {
				message.channel.createMessage("Command failed due to a permissions error");
			} else {
				throw err;
			}
		} catch(error) {
			message.channel.createMessage(`Error executing this command! ` +
				`Stack trace: ${bot.utils.codeBlock(err.stack)}`);
		}
	}
};
