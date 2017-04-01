const argHandler = require("./args.js");
module.exports = async message => {
	const guild = message.guild;

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

	for(let cmd of bot.commands) {
		if(command === cmd.name || ~cmd.aliases.indexOf(command)) {
			command = cmd;
			break;
		}
	}
	if(typeof command === "string") return;


	if((command.guildOnly || command.perm || command.type === "admin") && !guild) {
		message.channel.createMessage("This command is for guilds (servers) only. Sorry!");
	} else if(command.type === "creator" && !~bot.publicConfig.creators.indexOf(message.author.id)) {
		message.channel.createMessage("This command can only be used by the creators of the bot.");
	} else if(command.perm && !message.member.permission.has(command.perm)) {
		message.channel.createMessage(`You cannot run this command, it requires the permission ${command.perm}.`);
	}

	message.command = command;
	let args = message.args = await argHandler(message, command);
	if(typeof args === "string") {
		message.channel.createMessage(args);
		return;
	}

	try {
		let result = await command.run(message);

		let output = { content: "" }, file;
		if(Array.isArray(result)) {
			output.content = result[0];
			file = result[1];
		} else if(typeof result === "object") {
			output = result;
		} else if(result) {
			output.content = result;
		} else {
			output = false;
		}

		if(output) {
			if(output.content) output.content = output.content.substring(0, 2000);
			await message.channel.createMessage(output, file || null);
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
				`Stack trace ${bot.utils.codeBlock(error.stack)}`);
		}
	}
};
