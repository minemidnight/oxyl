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

bot.on("message", (message) => {
	let guild = message.guild;
	let msg = message.content.toLowerCase();

	if(message.author.bot) {
		return;
	} else if(!message.channel.type === "text") {
		message.channel.sendMessage("Oxyl only supports commands within guilds");
		return;
	}
	let guildConfig = configs.getConfig(guild);
	if(guildConfig.channels.ignored.value.includes(message.channel.id)) return;
	if(!message.member) {
		guild.fetchMember(message.author);
		return;
	} else {
		var roles = message.member.roles;
	}

	if(msg.match(prefix) && msg.match(prefix)[2]) {
		message.content = message.content.match(prefix)[2];

		let cmdInfo = framework.getCmd(message.content);
		var command = cmdInfo.cmd;
		if(command) {
			message.contentPreserved = cmdInfo.newContent;
			msg = message.contentPreserved.toLowerCase();
			message.content = msg;
		} else {
			message.contentPreserved = message.content;
			message.content = msg;
		}
	}

	if(!command) {
		let whitelistedRoles = guildConfig.roles.whitelist.value;
		let isWhitelisted = roles.some(role => whitelistedRoles.includes(role.id));

		if(!isWhitelisted) {
			let link = guildConfig.filters.link.value;
			let spam = guildConfig.filters.spam.value;

			if(link) {
				let linkFilter = new RegExp(config.options.linkFilter);
				if(linkFilter.test(message.content)) {
					message.delete();
					message.author.sendMessage(`Please do not send links in **${guild.name}**, it is not allowed.`);
				}
			}

			if(spam) {
				if(!spamData[guild.id]) {
					spamData[guild.id] = [];
				}

				let lastMessage = spamData[guild.id][message.author.id];

				if(lastMessage && lastMessage.length > 7 &&
             Math.abs(lastMessage.length - msg.length) < 5 &&
             lastMessage.substring(0, msg.length) === lastMessage) {
					message.delete();
					message.author.sendMessage(`Please do not spam in **${guild}**, it is not allowed.`);
				}

				spamData[guild.id][message.author.id] = msg;
			}
		}

		return;
	}

	if(command.type === "creator") {
		if(!config.creators.includes(message.author.id)) {
			message.channel.sendMessage(config.messages.notCreator);
			return;
		}
	} else if(command.type === "moderator") {
		let accepted = guildConfig.roles.mod.value;
		let isMod = roles.some(role => accepted.includes(role.id) || role.name.toLowerCase() === "bot commander");

		if(!isMod) {
			message.channel.sendMessage(config.messages.notMod);
			return;
		}
	} else if(command.type === "guild owner") {
		if(message.author.id !== guild.owner.id) {
			message.channel.sendMessage(config.messages.notGuildOwner);
			return;
		}
	} else if(command.type === "music") {
		let musicText = guildConfig.channels.musicText.value;
		if(musicText && musicText !== message.channel.id) {
			message.channel.sendMessage(config.messages.notMusicChannel);
			return;
		}
	}

	let arguments = message.contentPreserved.split(" ", command.args.length);
	let spaceCount = message.contentPreserved.match(/ /g);
	if(spaceCount && arguments && arguments.length < spaceCount.length) {
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
				var result = command.run(message);
				consoleLog(`[${framework.formatDate(new Date())}] ${framework.unmention(message.author)} ran \`${command.name}\` in **${guild.name}**`, "cmd");
			} catch(error) {
				consoleLog(`Failed command ${command.name} (${command.type})\n` +
				`**Error:** ${framework.codeBlock(error.stack)}`, "debug");
			} finally {
				if(result) message.channel.sendMessage(result, { split: true });
			}
		}).catch(reason => message.channel.sendMessage(reason));
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
			message.channel.sendMessage(`${reason}\nYou have 15 seconds to supply another argument, or it will time out`);
			message.channel.awaitMessages(newMsg => {
				if(newMsg.author.id === message.author.id) {
					return true;
				} else {
					return false;
				}
			}, { maxMatches: 1, time: 15000 })
			.then(responses => {
				if(!responses || responses.size === 0 || !responses.first()) reject("Command timed out");

				checkArg(responses.first().content, command.args[index], message)
				.then(newArg => {
					message.argsPreserved[index] = newArg;
					validateArgs(message, command, index + 1, message)
					.then(res => resolve(res))
					.catch(err => reject(err));
				}).catch(reason2 => reject(`${reason2}\nCommand cancelled`));
			});
		});
	});
}
