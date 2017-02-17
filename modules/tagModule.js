const math = require("mathjs");
const tableOrder = ["GlobalTags", "GuildTags", "ChannelTags", "UserTags", "UnlistedTags"];

async function getTag(query, message, table = 0, loop = true) {
	let tableName = tableOrder[table], dbQuery;

	if(tableName === "GlobalTags") {
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}'`;
	} else if(tableName === "GuildTags" || tableName === "ChannelTags") {
		let id = tableName === "GuildTags" ? message.channel.guild.id : message.channel.id;
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}' AND \`ID\` = '${id}'`;
	} else if(tableName === "UserTags") {
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}' AND \`CREATOR\` = '${message.author.id}'`;
	} else if(tableName === "UnlistedTags") {
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}'`;
	}

	let data = await framework.dbQuery(dbQuery);
	if(data && data[0]) {
		data[0].TYPE = tableName.substring(0, tableName.indexOf("Tags")).toLowerCase();
		return data[0];
	} else if(table < tableOrder.length - 1 && loop) {
		return await getTag(query, message, table + 1);
	} else {
		throw new Error("NO_RESULTS");
	}
}
exports.getTag = getTag;

function addUse(type, name, message) {
	type = tableOrder.find(table => table.toLowerCase().startsWith(type));
	if(type === "GlobalTags") {
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}'`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		let id = type === "GuildTags" ? message.channel.guild.id : message.channel.id;
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}' AND \`ID\` = '${id}'`);
	} else if(type === "UserTags") {
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}' AND \`CREATOR\` = '${message.author.id}'`);
	} else if(type === "UnlistedTags") {
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}'`);
	}
}
exports.addUse = addUse;

function createTag(data) {
	let type = data.type;
	type = tableOrder.find(table => table.toLowerCase().startsWith(type));
	if(type === "GlobalTags") {
		framework.dbQuery(`INSERT INTO \`${type}\`(\`CREATOR\`, \`NAME\`, \`CREATED_AT\`, \`CONTENT\`)` +
		`VALUES ('${data.creator}',${framework.sqlEscape(data.name)},'${data.createdAt}', ${framework.sqlEscape(data.content)})`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		framework.dbQuery(`INSERT INTO \`${type}\`(\`CREATOR\`, \`ID\`, \`NAME\`, \`CREATED_AT\`, \`CONTENT\`)` +
		`VALUES ('${data.creator}','${data.id}',${framework.sqlEscape(data.name)},'${data.createdAt}',${framework.sqlEscape(data.content)})`);
	} else {
		framework.dbQuery(`INSERT INTO \`${type}\`(\`CREATOR\`, \`NAME\`, \`CREATED_AT\`, \`CONTENT\`)` +
		`VALUES ('${data.creator}',${framework.sqlEscape(data.name)},'${data.createdAt}',${framework.sqlEscape(data.content)})`);
	}
}
exports.createTag = createTag;

function deleteTag(type, name, message) {
	type = tableOrder.find(table => table.toLowerCase().startsWith(type));
	if(type === "GlobalTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = ${framework.sqlEscape(name)}`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		let id = type === "GuildTags" ? message.channel.guild.id : message.channel.id;
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = ${framework.sqlEscape(name)} AND \`ID\` = '${id}'`);
	} else if(type === "UserTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = ${framework.sqlEscape(name)} AND \`CREATOR\` = '${message.author.id}'`);
	} else if(type === "UnlistedTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = ${framework.sqlEscape(name)}`);
	}
}
exports.deleteTag = deleteTag;

async function getUnlistedTags() {
	return await framework.dbQuery(`SELECT * FROM \`UnlistedTags\``);
}
exports.getUnlistedTags = getUnlistedTags;

async function getTags(message, fullData, table = 0) {
	let tableName = tableOrder[table], dbQuery;
	if(!fullData) {
		fullData = {
			global: [],
			guild: [],
			channel: [],
			user: []
		};
	}

	if(tableName === "GlobalTags") {
		dbQuery = `SELECT * FROM \`${tableName}\``;
	} else if(tableName === "GuildTags" || tableName === "ChannelTags") {
		let id = tableName === "GuildTags" ? message.channel.guild.id : message.channel.id;
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`ID\` = '${id}'`;
	} else if(tableName === "UserTags") {
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`CREATOR\` = '${message.author.id}'`;
	} else {
		return fullData;
	}

	let data = await framework.dbQuery(dbQuery);
	if(data && data.length >= 1) {
		let type = tableName.substring(0, tableName.indexOf("Tags")).toLowerCase();
		data.forEach(dataType => {
			dataType.TYPE = type;
		});

		fullData[type] = data;
	}

	if(table < tableOrder.length - 1) return await getTags(message, fullData, table + 1);
	else return fullData;
}
exports.getTags = getTags;

async function executeTag(tag, message) {
	tag = tag.CONTENT || tag;
	message.tagVars = {};

	let brackets = [(tag.match(/{/g) || []).length, (tag.match(/}/g) || []).length];
	if(brackets[0] !== brackets[1]) throw new Error("Unmatched brackets");

	if(message.argsPreserved[0].toLowerCase().startsWith("test")) {
		message.argsPreserved = [];
	} else {
		message.argsPreserved = message.argsPreserved[0].split(" ").splice(1);
		message.argsPreserved = message.argsPreserved.map(ele => ele
				.replace(/\u26FB|\u26FC/, "")
				.replace(/}/g, `${framework.spStart}lb${framework.spEnd}`)
				.replace(/{/g, `${framework.spStart}rb${framework.spEnd}`));
	}

	try {
		let result = await parseTag(tag, message);
		if(!result || result.length === 0) return `Tag result is an empty message`;
		else if(result.length >= 2000) return `Tag result is over 2000 characters`;
		else return result;
	} catch(err) {
		return err.message;
	}
}
exports.executeTag = executeTag;

async function parseTag(tag, message, resultArgs = []) {
	let depth = 0, startBracket, subtags = [];
	for(let i = 0; i < tag.length; i++) {
		let char = tag.charAt(i);
		if(char === "{") {
			if(depth === 0) startBracket = i;
			depth++;
		} else if(char === "}") {
			depth--;
			if(depth === 0) subtags.push(tag.substring(startBracket, i + 1));
		}
	}

	for(let subtag of subtags) {
		let tagName, passedArgs = [], originalSub = subtag;
		subtag = subtag.substring(1, subtag.length - 1);
		if(subtag.endsWith(":") && !subtag.includes("|")) {
			tagName = subtag.substring(0, subtag.length - 1);
		} else if(subtag.includes(":")) {
			tagName = subtag.substring(0, subtag.indexOf(":"));
			subtag = subtag.substring(subtag.indexOf(":") + 1);
			passedArgs = subtag.includes("|") ? passedArgs.concat(subtag.split("|")) : [subtag];
		} else {
			tagName = subtag;
		}
		tagName = tagName.toLowerCase();

		if(!tagManager[tagName]) throw new Error(`Invalid tag: \`${tagName}\``);

		try {
			for(let i in passedArgs) {
				let arg = passedArgs[i];
				if(arg.indexOf("{") !== -1 && arg.indexOf("}") !== -1) passedArgs[i] = await parseTag(arg, message);
			}

			if(resultArgs.length >= passedArgs.length && resultArgs.length >= 1) passedArgs = resultArgs;
			else if(resultArgs.length >= 1) passedArgs = resultArgs.concat(passedArgs.splice(resultArgs.length));

			let result = await tagManager[tagName].run(passedArgs, message) || "";
			if(typeof result === "object" && result.argsPreserved) message = result;
			else if(typeof result === "object" || typeof result === "undefined" || typeof result === "number") resultArgs = [result];
			else resultArgs = [];

			if(typeof result === "string" && result.indexOf("{") !== -1 && result.indexOf("}") !== -1) result = await parseTag(result, message, resultArgs);
			if(typeof result === "string") tag = tag.replace(originalSub, result);
			else tag = result;
		} catch(err) {
			if(typeof err === "object") throw err;
			else if(message.tagVars.fallback) throw new Error(message.tagVars.fallback);
			else throw new Error(`Error parsing at {\`${tagName}\`}\nMore Info: ${framework.codeBlock(err.stack || err)}`);
		}
	}

	if(typeof tag === "string") {
		tag = tag.replace(/@everyone/g, "@\u200Beveryone")
		.replace(/@here/g, "@\u200Bhere")
		.replace(/\u26FBlb\u26FC/g, "{")
		.replace(/\u26FBrb\u26FC/g, "}")
		.trim();
	}

	return tag;
}

const tagManager = {
	abs: {
		return: "Absolute value of a number",
		in: "-5",
		out: "5",
		usage: "<Number>",
		run: async args => Math.abs(parseFloat(args[0]))
	},
	allargs: {
		return: "All arguments combined",
		in: "@%You said: {allargs}",
		out: `"You said: testing args"`,
		run: async (args, message) => message.argsPreserved.length >= 0 ? message.argsPreserved.join(" ") : ""
	},
	arg: {
		return: "Argument number requested",
		in: "@%{math:{arg:0}/{arg:1}",
		out: "2",
		usage: "<Number>",
		run: async (args, message) => message.argsPreserved[parseInt(args[0])]
	},
	argcount: {
		return: "Amount of args",
		out: "2",
		run: async (args, message) => message.argsPreserved.length
	},
	author: {
		return: "User who sent the message",
		out: "{ Object User }",
		run: async (args, message) => message.author
	},
	avatar: {
		return: "User's avatar URL",
		in: "{author}",
		out: `"https://cdn.discordapp.com/avatars/..."`,
		usage: "<Member/User Object>",
		run: async args => args[0].user ? args[0].user.avatarURL : args[0].avatarURL
	},
	capitalize: {
		return: "A string capitalized",
		in: "Hello World!",
		out: `"HELLO WORLD!"`,
		usage: "<String>",
		run: async args => args[0].toString().toUpperCase()
	},
	ceil: {
		return: "Number rounded up",
		in: "3.1",
		out: "4",
		usage: "<Number>",
		run: async args => Math.ceil(parseFloat(args[0]))
	},
	channel: {
		return: "Current Channel",
		out: "{ Object Channel }",
		run: async (args, message) => message.channel
	},
	charat: {
		return: "Character at a certain place",
		in: "hello|0",
		out: `"h"`,
		usage: "<String> <Number>",
		run: async args => args[0].toString().charAt(args[1])
	},
	choose: {
		return: "Random choice out of the choices given",
		in: "cake|pie",
		out: `"pie"`,
		usage: "<Strings...>",
		run: async args => args[Math.floor(Math.random() * args.length)]
	},
	createdat: {
		return: "When a channel/guild/user was created",
		in: "{guild}",
		out: `"Sunday, November 01 2015, 08:46:38"`,
		usage: "<Channel/Guild/User Object>",
		run: async args => framework.formatDate(args[0].createdAt)
	},
	discriminator: {
		return: "A user's discriminator",
		in: "{author}",
		out: `"1537"`,
		usage: "<Member/User Object>",
		run: async args => args[0].user ? args[0].user.discriminator : args[0].discriminator
	},
	fallback: {
		return: "Sets fallback text if the tag fails, instead of the default",
		in: "This tag failed! :(",
		out: `"" (nothing)`,
		usage: "<String>",
		run: async (args, message) => {
			message.tagVars.fallback = args[0];
			return message;
		}
	},
	floor: {
		return: "Rounded down number",
		in: "3.7421",
		out: "3",
		usage: "<Number>",
		run: async args => Math.floor(parseFloat(args[0]))
	},
	game: {
		return: "Game of a member",
		in: "{member}",
		out: `"Rocket League"`,
		usage: "<Member Object>",
		run: async args => args[0].game ? args[0].game.name : "None"
	},
	getmember: {
		return: "Member from ID (Only searches current guild)",
		in: "155112606661607425",
		out: "{ Object Member }",
		usage: "<Member/User ID>",
		run: async (args, message) => message.channel.guild.members.get(args[0])
	},
	getuser: {
		return: "User from ID (Only searches current guild)",
		in: "155112606661607425",
		out: "{ Object User }",
		usage: "<Member/User ID>",
		run: async (args, message) => message.channel.guild.members.get(args[0]).user
	},
	guild: {
		return: "Current Guild (server)",
		out: "{ Object Guild }",
		run: async (args, message) => message.channel.guild
	},
	icon: {
		return: "Icon of a guild",
		in: "{guild}",
		out: `"https://cdn.discordapp.com/icons/..."`,
		usage: "<Guild Object>",
		run: async args => args[0].iconURL
	},
	id: {
		return: "ID of channel/guild/user",
		in: "{author}",
		out: `"254768930223161344"`,
		usage: "<Channel/Guild/User Object>",
		run: async args => args[0].id
	},
	if: {
		return: "Use conditionals to execute code (<=, <, >, >=, !=, =, includes, startswith, endswith)",
		in: "{game:{member}}|!==|None|Playing {game:{member}}|Not playing a game",
		out: `"Not playing a game"`,
		usage: "<Argument> <Conditional> <Argument> <Then> [Else]",
		run: async args => {
			if(args.length < 4) throw new Error;
			let result;
			if(args[1] === "<=") {
				result = args[0] <= args[2];
			} else if(args[1] === ">=") {
				result = args[0] >= args[2];
			} else if(args[1] === "=" || args[1] === "==" || args[1] === "===") {
				result = args[0] === args[2];
			} else if(args[1] === "!=" || args[1] === "=/=" || args[1] === "!==") {
				result = args[0] !== args[2];
			} else if(args[1] === "startswith") {
				result = args[0].startWith(args[2]);
			} else if(args[1] === "endswith") {
				result = args[0].endsWith(args[2]);
			} else if(args[1] === "includes" || args[1] === "contains") {
				result = args[0].includes(args[2]);
			} else if(args[1] === "<") {
				result = args[0] < args[2];
			} else if(args[1] === ">") {
				result = args[0] > args[2];
			} else {
				throw new Error();
			}

			if(result) {
				return args[3];
			} else {
				return args[4] || "";
			}
		}
	},
	int: {
		return: "Random integer (whole number) between two numbers",
		in: "3|9",
		out: "6",
		usage: "<Number> <Number>",
		run: async args => Math.floor(Math.random() * (parseInt(args[1]) - parseInt(args[0]))) + parseInt(args[0])
	},
	isnan: {
		return: "If something is a not a number",
		in: "4.3",
		out: `"false"`,
		usage: "<Argument>",
		run: async args => isNaN(args[0])
	},
	isset: {
		return: "If something is set",
		in: "{args:0}",
		out: `"true"`,
		usage: "<Anything>",
		run: async args => args[0] ? "true" : "false"
	},
	join: {
		return: "Array joined by a character",
		in: "{split:abc|b}|d",
		out: `"adc"`,
		usage: "<Array> [String]",
		run: async args => args[0].join(args[1])
	},
	length: {
		return: "Length of string",
		in: "hello",
		out: "5",
		usage: "<String>",
		run: async args => args[0].length
	},
	lower: {
		return: "A string converted to lowercase",
		in: "Today is Decemeber 26th",
		out: `"today is decemember 26th"`,
		usage: "<String>",
		run: async args => args[0].toString().toLowerCase()
	},
	map: {
		return: "New array with results based on argument (&this; is the looped element)",
		in: "{split:abc|b}|:regional_indicator_&this;:",
		out: `[":regional_indicator_a:",":regional_indicator_c:"]`,
		usage: "<Array> <New Value>",
		run: async args => args[0].map(ele => args[1].replace(/&this;/g, ele.toString()))
	},
	math: {
		return: "Evaluate a math expression",
		in: "5*9",
		out: "45",
		usage: "<Expression>",
		run: async args => math.eval(args[0])
	},
	member: {
		return: "Guild member who sent the message (can get nickname from this, but not user)",
		out: "{ Object Member }",
		run: async (args, message) => message.member
	},
	memberjoinedat: {
		return: "When a member joined the current guild",
		in: "{member}",
		out: `"Sunday, Decemeber 11 2016, 17:49:30"`,
		usage: "<Member Object>",
		run: async (args, message) => framework.formatDate(args[0].joinedAt)
	},
	membercount: {
		return: "Amount of members in a guild",
		in: "{guild}",
		out: "34",
		usage: "<Guild Object>",
		run: async (args, message) => message.channel.guild.memberCount
	},
	mention: {
		return: "Mention of a channel or user",
		in: "{channel}",
		out: `"#general"`,
		usage: "<Channel/User Object>",
		run: async args => args[0].mention
	},
	name: {
		return: "Name of channel/guild",
		in: "{guild}",
		out: `"Oxyl Support"`,
		usage: "<Channel/Guild Object>",
		run: async args => args[0].name
	},
	nickname: {
		return: "Nickname of a member",
		in: "{member}",
		out: `"mememidnight"`,
		usage: "<Member Object>",
		run: async args => args[0].nick || args[0].user.username
	},
	nl: {
		return: "New line (\\n)",
		in: "@%Hello!{nl}You are {username:{member}}",
		out: `"Hello\nYou are minemidnight"`,
		run: async args => "\n"
	},
	now: {
		return: "Current Time",
		out: `"Monday, Decemeber 26 2016, 23:03:53"`,
		run: async args => framework.formatDate(new Date())
	},
	num: {
		return: "Random number (not whole) between two numbers",
		in: "2|6",
		out: "3.64",
		usage: "<Number> <Number>",
		run: async args => (Math.random() * (parseFloat(args[1]) - parseFloat(args[0]))) + parseFloat(args[0])
	},
	parsefloat: {
		return: "String parsed as a float (number with decimals)",
		in: "@%{parseFloat:5} {parseFloat:5.25} {parseFloat:abc}",
		out: "5.00 5.25 NaN",
		usage: "<String>",
		run: async args => parseFloat(args[0])
	},
	parseint: {
		return: "String parsed as integer",
		in: "@%{parseInt:5} {parseInt:5.25} {parseInt:abc}",
		out: "5 NaN NaN",
		usage: "<String>",
		run: async args => parseInt(args[0])
	},
	regex: {
		return: "Specified match of regex execution",
		in: "aaab|a+|0|gi",
		out: `"aaa"`,
		usage: "<String> <Regex> <Group> <Number> [Flags <String>]",
		run: async args => {
			let match = new RegExp(args[1], args[3] || "").exec(args[0]);
			if(match) return match[args[2]];
			else return undefined;
		}
	},
	repeat: {
		return: "Repeats a phrase as many times as you'd like (do not forget the character limit)",
		in: "hi|3",
		out: `"hihihi"`,
		usage: "<String> <Number>",
		run: async args => args[0].repeat(parseInt(args[1]))
	},
	replace: {
		return: "Replace the first instance of a text with another text",
		in: "hello world|world|earth",
		out: `"hello earth"`,
		usage: "<String> <String> <String>",
		run: async args => args[0].replace(args[1], args[2])
	},
	replaceall: {
		return: "Replace all instances of a text with another text",
		in: "world hello world|world|earth",
		out: `"earth hello earth"`,
		usage: "<String> <String> <String>",
		run: async args => args[0].replace(new RegExp(framework.escapeRegex(args[1]), "g"), args[2])
	},
	replaceregex: {
		return: "Replace all instances of a text in a string using regex",
		in: "Hello wolrd!|wo[rl]{2}d|earth|g",
		out: `"Hello earth!"`,
		usage: "<String> <Regex> <String> [Flags <String>]",
		run: async args => args[0].replace(new RegExp(args[1], args[3] || ""), args[2])
	},
	roles: {
		return: "Array of ID of roles a member has",
		out: `["110375768374136832"]`,
		usage: "<Member>",
		run: async args => args[0].roles
	},
	round: {
		return: "Rounded number",
		in: "3.5",
		out: "4",
		usage: "<Number>",
		run: async args => Math.round(parseFloat(args[0]))
	},
	settype: {
		return: "Parses an argument as a specific type to use later, accepted types are text, int, float or mention/user",
		in: "0|user",
		out: `"" (nothing)`,
		usage: "<Integer> <String <ArgType>>",
		run: async (args, message) => {
			const validator = Oxyl.modScripts.commandArgs;
			let index = parseInt(args[0]);
			let newArg = await validator.test(message.argsPreserved[index], { type: args[1] }, message);
			message.argsPreserved[index] = newArg;
			return message;
		}
	},
	split: {
		return: "Array of text split at a character",
		in: "lolabc|a",
		out: `["lol","bc"]`,
		usage: "<String> [String]",
		run: async args => args[0].split(args[1] || "")
	},
	status: {
		return: "A user's status",
		in: "{member}",
		out: `"online"`,
		usage: "<Member Object>",
		run: async args => args[0].status
	},
	substring: {
		return: "Gets a part of a phrase",
		in: "test|1|3",
		out: `"es"`,
		usage: "<String>",
		run: async args => args[0].toString().substring(args[1], args[2])
	},
	tvar: {
		return: "A temporary variable (must be set before using)",
		in: "@%{tvar:uname|{username:{author}}} {tvar:uname}",
		out: `"minemidnight"`,
		usage: "<String> [New Value (Anything)]",
		run: async (args, message) => {
			if(args[1]) {
				message.tagVars[args[0]] = args[1];
				return message;
			} else {
				return message.tagVars[args[0]];
			}
		}
	},
	unmention: {
		return: "Username#Discriminator",
		in: "{author}",
		out: `"minemidnight#1537"`,
		usage: "<Member/User Object>",
		run: async args => framework.unmention(args[0])
	},
	user: {
		return: "Alias for author -- user who sent message / user from event",
		out: "{ Object User }",
		run: async (args, message) => message.author
	},
	username: {
		return: "A user's username",
		in: "{author}",
		out: `"minemidnight"`,
		usage: "<Member/User Object>",
		run: async args => args[0].user ? args[0].user.username : args[0].username
	}
};
module.exports.info = tagManager;
module.exports.sorted = Object.keys(tagManager).sort();
