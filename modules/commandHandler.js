const configs = require("../modules/serverconfigs.js"),
	validator = require("../modules/commandArgs.js"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");

const bot = Oxyl.bot,
	config = framework.config,
	commands = framework.commands,
	consoleLog = framework.consoleLog,
	prefix = new RegExp(config.options.prefixRegex, "i");

const spamData = {};

bot.on("messageCreate", (message) => {
	let guild = message.guild;
	let msg = message.content.toLowerCase();
	if(message.author.bot) return;

	if(msg.match(prefix) && msg.match(prefix)[2]) {
		message.content = message.content.match(prefix)[2];

		let cmdInfo = framework.getCmd(message.content);
		var command = cmdInfo.cmd;
		if(command) {
			message.contentPreserved = cmdInfo.newContent;
			msg = message.contentPreserved.toLowerCase();
			message.content = msg;
		} else {
			return;
		}
	} else {
		return;
	}

	if((command.guildOnly && !message.guild) || (command.perm && !message.guild)) {
		message.channel.createMessage("This command only works in guilds (servers)");
		return;
	} else if(command.type === "creator" && !config.creators.includes(message.author.id)) {
		message.channel.createMessage(config.messages.notCreator);
		return;
	} else if(command.type === "guild owner" && message.author.id !== guild.ownerID) {
		message.channel.createMessage(config.messages.notGuildOwner);
		return;
	} else if(command.perm && !message.channel.permissionsOf(message.author.id).has(command.perm)) {
		message.channel.createMessage(config.messages.invalidPerms.replace(/{PERM}/g, command.perm));
		return;
	}

	let arguments = message.contentPreserved.split(" ", command.args.length);
	let spaceCount = message.contentPreserved.match(/ /g);
	if(spaceCount && arguments && arguments.length <= spaceCount.length) {
		let i = framework.nthIndex(message.contentPreserved, " ", arguments.length);
		arguments[arguments.length - 1] += message.contentPreserved.substring(i);
	}
	message.argsUnparsed = arguments;
	message.argsPreserved = [];

	validateArgs(message, command)
		.then(newMsg => {
			message = newMsg;

			message.args = message.argsPreserved.map(ele => {
				if(typeof ele === "string") {
					return ele.toLowerCase();
				} else {
					return ele;
				}
			});

			try {
				let startText = `[${framework.formatDate(new Date())}] ${framework.unmention(message.author)} ran \`${command.name}\` in`;
				let argsText = `\n      Args: ${message.argsPreserved}`;
				if(guild) {
					consoleLog(`${startText} **${guild.name}**${argsText}`, "cmd");
				} else {
					consoleLog(`${startText} **DM**${argsText}`, "cmd");
				}

				var result = command.run(message);
			} catch(error) {
				consoleLog(`Failed command ${command.name} (${command.type})\n` +
				`**Error:** ${framework.codeBlock(error.stack)}`, "debug");
			} finally {
				if(result && result.length > 2000 && !result.includes("\n")) message.channel.createMessage("Message exceeds 2000 characters :(");
				else if(result) message.channel.createMessage(result);
			}
		}).catch(reason => { if(reason) message.channel.createMessage(reason); });
});

function checkArg(input, arg, message) {
	return new Promise((resolve, reject) => {
		if(!input && arg.optional) resolve(input);
		if(!input && arg.type !== "custom") {
			reject(`No input given for ${arg.label} (${arg.type})`);
			return;
		}

		validator.test(input, arg, message)
		.then(value => resolve(value))
		.catch(reason => reject(reason));
	});
}

function validateArgs(message, command, index) {
	if(index === undefined) index = 0;
	return new Promise((resolve, reject) => {
		if(index >= command.args.length) {
			resolve(message);
			return;
		}

		checkArg(message.argsUnparsed[index], command.args[index], message).then(newArg => {
			message.argsPreserved[index] = newArg;
			validateArgs(message, command, index + 1)
			.then(res => resolve(res))
			.catch(err => reject(err));
		}).catch(reason => {
			message.channel.createMessage(`${reason}\nYou have 15 seconds to supply another argument, or it will time out`);
			framework.awaitMessages(message.channel, newMsg => {
				if(newMsg.author.id === message.author.id) {
					return true;
				} else {
					return false;
				}
			}, { maxMatches: 1, time: 15000 })
			.then(responses => {
				if(!responses || responses.size === 0 || !responses[0]) {
					reject("Command timed out");
					return;
				}

				checkArg(responses[0].content, command.args[index], message)
				.then(newArg => {
					message.argsPreserved[index] = newArg;
					validateArgs(message, command, index + 1, message)
					.then(res => resolve(res))
					.catch(err => reject(err));
				})
				.catch(reason2 => reject(`${reason2}\nCommand cancelled`));
			});
		});
	});
}
