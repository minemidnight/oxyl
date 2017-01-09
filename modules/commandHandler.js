const validator = require("../modules/commandArgs.js"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");

const bot = Oxyl.bot,
	commands = Oxyl.commands,
	prefix = new RegExp(framework.config.options.prefixRegex, "i");

bot.on("messageCreate", (message) => {
	Oxyl.siteScripts.website.messageCreate(message);
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

	if(command.onCooldown(message.author)) {
		message.channel.createMessage(framework.config.messages.onCooldown);
		return;
	} else if((command.guildOnly && !message.guild) || (command.perm && !message.guild)) {
		message.channel.createMessage(framework.config.messages.guildOnly);
		return;
	} else if(command.type === "creator" && !framework.config.creators.includes(message.author.id)) {
		message.channel.createMessage(framework.config.messages.notCreator);
		return;
	} else if(command.type === "guild owner" && framework.guildLevel(message.member) > 3) {
		message.channel.createMessage(framework.config.messages.notGuildOwner);
		return;
	} else if(command.perm && !message.channel.permissionsOf(message.author.id).has(command.perm)) {
		message.channel.createMessage(framework.config.messages.invalidPerms.replace(/{PERM}/g, command.perm));
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
				if(typeof ele === "string") return ele.toLowerCase();
				else return ele;
			});

			try {
				var result = command.run(message);
			} catch(error) {
				framework.consoleLog(`Failed command ${command.name} (${command.type})\n` +
				`**Error:** ${framework.codeBlock(error.stack)}`, "debug");
				message.channel.createMessage("Bot error when executing command -- error sent to Support Server");
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
			reject(`No value given for ${arg.label} (type: ${arg.type})`);
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
		}).catch(reason => message.channel.createMessage(`${reason}\nCommand terminated.`));
	});
}
