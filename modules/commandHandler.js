const validator = require("../modules/commandArgs.js"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	sse = require("../site/routes/sse.js");

const prefixes = exports.prefixes = {};
const blacklist = exports.blacklist = [];
// wait for connection
setTimeout(async () => {
	let prefixArray = await framework.dbQuery("SELECT * FROM `Settings` WHERE `NAME` = 'prefix'");
	prefixArray.forEach(data => {
		prefixes[data.ID] = data.VALUE;
	});

	let blacklistedUsers = await framework.dbQuery("SELECT * FROM `Blacklist`");
	blacklistedUsers.forEach(data => {
		blacklist.push(data.USER);
	});
}, 2500);

const bot = Oxyl.bot,
	commands = Oxyl.commands;

bot.on("messageCreate", async (message) => {
	sse.messageCreate(message);
	if(message.author.bot || blacklist[message.author.id]) return;
	let guild = message.channel.guild;
	let msg = message.content.toLowerCase();

	let prefix = framework.config.options.prefixRegex;
	if(guild && prefixes[guild.id]) prefix = prefix.replace("{PREFIX}", `|${framework.escapeRegex(prefixes[guild.id])}`);
	else prefix = prefix.replace("{PREFIX}", "");
	prefix = new RegExp(prefix, "i");

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
	} else if((command.guildOnly && !message.channel.guild) || (command.perm && !message.channel.guild)) {
		message.channel.createMessage(framework.config.messages.guildOnly);
		return;
	} else if(command.type === "creator" && !framework.config.creators.includes(message.author.id)) {
		message.channel.createMessage(framework.config.messages.notCreator);
		return;
	} else if(command.type === "guild owner" && framework.guildLevel(message.member) < 3) {
		message.channel.createMessage(framework.config.messages.notGuildOwner);
		return;
	} else if(command.perm && !message.member.permission.has(command.perm)) {
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

	try {
		var validated = await validateArgs(message, command);

		message = validated;
		message.args = message.argsPreserved.map(ele => {
			if(typeof ele === "string") return ele.toLowerCase();
			else return ele;
		});

		try {
			var result = await command.run(message);

			msg = { content: "" };
			let file;

			if(Array.isArray(result)) {
				msg.content = result[0];
				file = result[1];
			} else if(typeof result === "object") {
				msg = result;
			} else if(result) {
				msg.content = result;
			} else {
				msg = false;
			}

			if(msg) {
				if(msg.content) msg.content = msg.content.substring(0, 2000);
				try {
					var resultmsg = await message.channel.createMessage(msg, file || null);
				} catch(err) {
					message.channel.createMessage("Error sending message");
				}
			}
		} catch(error) {
			framework.consoleLog(`Failed command ${command.name} (${command.type})\n` +
				`**Error:** ${framework.codeBlock(error.stack)}`, "debug");
			message.channel.createMessage("Bot error when executing command -- error sent to Support Server");
		}
	} catch(err) {
		message.channel.createMessage(err.toString());
	}
});

async function checkArg(input, arg, message) {
	if(!input && arg.optional) {
		return input;
	} else if(!input && arg.type !== "custom") {
		throw new Error(`No value given for ${arg.label} (type: ${arg.type})`);
	} else {
		return await validator.test(input, arg, message);
	}
}

async function validateArgs(message, command, index = 0) {
	if(index >= command.args.length) return message;
	try {
		var newArg = await checkArg(message.argsUnparsed[index], command.args[index], message);
		message.argsPreserved[index] = newArg;
		return await validateArgs(message, command, index + 1);
	} catch(err) {
		throw new Error(`${err}\nCommand terminated`);
	}
}
