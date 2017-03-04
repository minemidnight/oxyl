const Oxyl = require("./oxyl.js"),
	fs = require("fs"),
	request = require("request"),
	yaml = require("js-yaml"),
	path = require("path"),
	EventEmitter = require("events").EventEmitter;

exports.spStart = "\u26FB";
exports.spEnd = "\u26FC";
exports.config = yaml.safeLoad(fs.readFileSync("./private/config.yml"));
global.Oxyl = Oxyl;

exports.guildLevel = (member) => {
	let perms = member.permission, guild = member.guild;
	if(exports.config.creators.includes(member.id)) return 4;
	else if(guild.ownerID === member.id || perms.has("administrator")) return 3;
	else if(perms.has("manageGuild")) return 2;
	else if(perms.has("kickMembers") && perms.has("banMembers")) return 1;
	else return 0;
};

exports.splitParts = (message) => {
	if(message.length < 2000) {
		return [message];
	} else {
		let returnData = [], nth = 1, splitTimes = Math.floor(message.length / 2000);
		while(returnData.length < splitTimes) {
			if(exports.nthIndex(message, "\n", nth) > 2000) {
				let grabFrom = exports.nthIndex(message, "\n", nth - 1);
				returnData.push(message.substring(0, grabFrom));
				message = message.substring(grabFrom);
				nth = 1;
			} else {
				nth++;
			}
		}

		returnData.push(message);
		return returnData;
	}
};

exports.escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&", "g");

exports.nthIndex = (string, pattern, nth) => {
	let len = string.length, i = -1;
	while(nth-- && i++ < len) {
		i = string.indexOf(pattern, i);
		if(i < 0) break;
	}
	return i;
};

exports.getContent = (link, options = {}) => {
	options.url = link;
	return new Promise((resolve, reject) => {
		request(options, (error, response, body) => {
			if(!error && response.statusCode === 200) resolve(body);
			else reject(error);
		});
	});
};

exports.getCmd = (msgCase) => {
	let msg = msgCase.toLowerCase();
	let commands = Oxyl.commands;
	let prefix = exports.config.options.prefixRegex;
	let returnData = {};

	let cmdCheck;
	if(msg.indexOf(" ") === -1) cmdCheck = msg;
	else cmdCheck = msg.substring(0, msg.indexOf(" "));

	for(let cmdType in commands) {
		for(let cmd in commands[cmdType]) {
			cmd = commands[cmdType][cmd];
			let possibleStarts = cmd.aliases.slice(0);
			possibleStarts.push(cmd.name);

			for(let i in possibleStarts) {
				let loopCmd = possibleStarts[i];
				if(cmdCheck === loopCmd) {
					returnData = {
						newContent: msgCase.substring(loopCmd.length, msg.length).trim(),
						cmd: cmd
					};
				}
			}
		}
	}
	return returnData;
};

exports.findCommand = (cmdSearch) => {
	let commands = Oxyl.commands;
	for(let cmdType in commands) {
		for(let cmd in commands[cmdType]) {
			cmd = commands[cmdType][cmd];
			let possibleStarts = cmd.aliases.slice(0);
			possibleStarts.push(cmd.name);

			if(possibleStarts.includes(cmdSearch)) return cmd;
		}
	}
	return false;
};

exports.formatDate = (toFormat) => {
	let date = new Date(toFormat);
	let months = ["January", "February", "March", "April", "May", "June", "July",
		"August", "September", "October", "November", "Decemeber"];
	let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	let month = months[date.getMonth()];
	let day = date.getDate();
	let weekday = weekdays[date.getDay()];
	let hour = date.getHours();
	let min = date.getMinutes();
	let sec = date.getSeconds();
	let year = date.getFullYear();

	day = (day < 10 ? "0" : "") + day;
	hour = (hour < 10 ? "0" : "") + hour;
	min = (min < 10 ? "0" : "") + min;
	sec = (sec < 10 ? "0" : "") + sec;

	return `${weekday}, ${month} ${day} ${year}, ${hour}:${min}:${sec}`;
};

exports.capitalizeEveryFirst = (string) => string.split(" ").map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(" ");

exports.codeBlock = (content, lang) => {
	if(!lang) lang = "";
	return `\n\`\`\`${lang}\n${content}\n\`\`\``;
};

exports.unmention = user => {
	if(user.user) user = user.user;
	return `${user.username}#${user.discriminator}`;
};

exports.consoleLog = (message, type) => {
	let channel;
	if(type === "command" || type === "cmd") channel = "commands";
	else channel = type;

	channel = exports.config.channels[channel];
	if(!type) type = "!";
	console.log(`[${type.toUpperCase()}] ${message}`);
	if(channel && bot.uptime > 0) bot.createMessage(channel, message);
};

class MessageCollector extends EventEmitter {
	constructor(channel, filter, options = {}) {
		super();
		this.filter = filter;
		this.channel = channel;
		this.options = options;
		this.ended = false;
		this.collected = [];

		this.listener = message => this.verify(message);
		bot.on("messageCreate", this.listener);
		if(options.time) setTimeout(() => this.stop("time"), options.time);
	}

	verify(message) {
		if(this.channel.id !== message.channel.id) return false;
		if(this.filter(message)) {
			this.collected.push(message);

			this.emit("message", message);
			if(this.collected.length >= this.options.maxMatches) this.stop("maxMatches");
			return true;
		}
		return false;
	}

	stop(reason) {
		if(this.ended) return;
		this.ended = true;
		bot.removeListener("messageCreate", this.listener);

		this.emit("end", this.collected, reason);
	}
}

exports.awaitMessages = async (channel, filter, options) => {
	const collector = new MessageCollector(channel, filter, options);
	return new Promise((resolve, reject) => {
		collector.on("end", (collection, reason) => {
			if(!collection || collection.size === 0) {
				resolve(collection, reason);
			} else {
				resolve(collection, reason);
			}
		});
	});
};

exports.findFile = (dirs, name, ext) => {
	let fileName, dirName;
	for(let i = 0; i < dirs.length; i++) {
		let files = exports.getFiles(dirs[i]);

		if(ext) {
			fileName = files.find(file => file.substring(file.lastIndexOf("/") + 1).toLowerCase() === `${name}.${ext}`);
		} else {
			fileName = files.find(file => file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf(".")).toLowerCase() === `${name}`);
		}

		if(fileName) {
			dirName = fileName.substring(0, fileName.lastIndexOf("/") + 1);
			fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
			break;
		}
	}
	if(!dirName && !fileName) return false;
	else return [dirName, fileName];
};

exports.getFiles = (filePath, filter = (file) => true) => {
	let dirFiles = fs.readdirSync(filePath);
	let fullFiles = [];
	dirFiles.forEach(file => {
		let stats = fs.lstatSync(`${filePath}${file}`);
		if(stats.isDirectory() && file !== "public" && file !== "routes") {
			let toAdd = exports.getFiles(`${filePath}${file}/`, filter);
			fullFiles = fullFiles.concat(toAdd);
		} else if(filter(file)) {
			fullFiles.push(`${filePath}${file}`);
		}
	});
	return fullFiles;
};

exports.loadScripts = (filePath) => {
	let scripts = {};
	let dirFiles = exports.getFiles(filePath, file => file.endsWith(".js"));
	for(let i in dirFiles) {
		i = dirFiles[i];
		scripts[i.substring(i.lastIndexOf("/") + 1, i.length - 3)] = exports.loadScript(i);
	}

	exports.consoleLog(`Loaded scripts at ${filePath}`);
	return scripts || false;
};

exports.loadScript = (scriptPath) => {
	let script = path.resolve(scriptPath);
	delete require.cache[require.resolve(script)];
	let requirement = require(scriptPath);

	let dir = script.substring(script.indexOf("oxyl/") + 5);
	dir = dir.substring(0, dir.indexOf("/"));
	let scriptName = script.substring(script.lastIndexOf("/") + 1, script.length - 3);

	if(dir === "commands") Oxyl.cmdScripts[scriptName] = requirement;
	else if(dir === "modules") Oxyl.modScripts[scriptName] = requirement;
	else if(dir === "site") Oxyl.siteScripts[scriptName] = requirement;
	return requirement;
};

exports.listConstructor = (obj, index, follower) => {
	let msg = "", objSize = obj.length - 1;
	for(let i = 0; i <= objSize; i++) {
		let value = obj[i];
		let addFollower = true;
		let toAdd = "", current = "";

		if(index && index > 0) {
			if(follower) {
				current = "  ".repeat(index);
				// Gets the perfect spacing
			} else {
				current = "║".repeat(index);
				addFollower = false;
			}
		} else {
			index = 0;
		} if(i === objSize || (Array.isArray(obj[objSize]) && i === objSize - 1)) {
			current += "╚";
		} else {
			current += "╠";
			addFollower = false;
		}

		if(Array.isArray(value)) {
			toAdd = exports.listConstructor(value, index + 1, addFollower);
		} else {
			current = current.split("").join(" ");
			toAdd = `\n **${current}** ${value}`;
		}

		msg += toAdd;
	}
	return msg;
};

async function updateRemind() {
	let waiting = await Oxyl.modScripts.sqlQueries.dbQuery(`SELECT * FROM Reminders WHERE DATE <= ${Date.now()}`);
	if(!waiting || waiting.length === 0) return;
	waiting.forEach(async reminder => {
		if(!bot.users.has(reminder.USER)) return;
		let dm = await bot.users.get(reminder.USER).getDMChannel();

		dm.createMessage(`Hello, you asked me to remind you about this on ${exports.formatDate(reminder.CREATED)}:\n\n ${reminder.MESSAGE}`);
	});

	Oxyl.modScripts.sqlQueries.dbQuery(`DELETE FROM Reminders WHERE NO_DUPLICATE IN (${waiting.map(reminder => reminder.NO_DUPLICATE).join(",")})`);
}
setInterval(updateRemind, 15000);
