const Oxyl = require("./oxyl.js"),
	fs = require("fs"),
	request = require("request"),
	yaml = require("js-yaml"),
	path = require("path"),
	EventEmitter = require("events").EventEmitter,
	mysql = require("promise-mysql");

exports.config = yaml.safeLoad(fs.readFileSync("./private/config.yml"));

let dbData = exports.config.database;
dbData.password = exports.config.private.databasePass;
exports.sqlEscape = mysql.escape;
mysql.createConnection(dbData).then(connection => {
	exports.dbQuery = (query) => connection.query(query);
});

exports.guildLevel = (member) => {
	let perms = member.permission, guild = member.guild;
	if(exports.config.creators.includes(member.id)) return 4;
	else if(guild.ownerID === member.id) return 3;
	else if(perms.has(32)) return 2;
	else if(perms.has(2) && perms.has(4)) return 1;
	else return 0;
};

exports.getSetting = (guild, setting) => {
	let query = `SELECT \`VALUE\` FROM \`Settings\` WHERE \`ID\` = '${guild.id}' AND \`Name\` = '${setting}'`;
	return new Promise((resolve, reject) => {
		exports.dbQuery(query).then(res => {
			console.log(res && res[0], res[0].VALUE);
			if(res && res[0]) resolve(res[0].VALUE);
			else reject();
		});
	});
};

exports.setSetting = (guild, setting, value) => {
	exports.getSetting(guild, setting)
	.then(() => exports.dbQuery(`UPDATE \`Settings\` SET \`VALUE\`='${value}' WHERE \`ID\` = '${guild.id}' AND \`Name\` = '${setting}'`))
	.catch(() => exports.dbQuery(`INSERT INTO \`Settings\`(\`NAME\`, \`VALUE\`, \`ID\`) VALUES ('${setting}','${value}','${guild.id}')`));
};

exports.splitParts = (message) => {
	if(message.length < 2000) {
		return [message];
	} else if(message.indexOf("\n") === -1 || message.indexOf("\n") > 2000) {
		return new Error("!! Invalid message split attempt -- no new line found or new line past 2000th character");
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

		return returnData;
	}
};

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
			if(!error && response.statusCode === 200) {
				resolve(body);
			} else {
				reject(error);
			}
		});
	});
};

exports.getCmd = (msgCase) => {
	let msg = msgCase.toLowerCase();
	let commands = Oxyl.commands;
	let prefix = exports.config.options.prefixRegex;
	let returnData = {};

	let cmdCheck;
	if(msg.indexOf(" ") === -1) {
		cmdCheck = msg;
	} else {
		cmdCheck = msg.substring(0, msg.indexOf(" "));
	}

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
	var date = new Date(toFormat);
	var months = ["January", "February", "March", "April", "May", "June", "July",
		"August", "September", "October", "November", "Decemeber"];
	var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var month = months[date.getMonth()];
	var day = date.getDate();
	var weekday = weekdays[date.getDay()];
	var hour = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();
	var year = date.getFullYear();

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

exports.unmention = (user) => {
	if(user.user) user = user.user;
	return `${user.username}#${user.discriminator}`;
};

exports.consoleLog = (message, type) => {
	let channel;
	if(type === "command" || type === "cmd") {
		channel = "commands";
	} else {
		channel = type;
	}

	channel = exports.config.channels[channel];
	if(!type) type = "!";
	console.log(`[${type.toUpperCase()}] ${message}`);
	if(channel && Oxyl.bot.uptime > 0) Oxyl.bot.createMessage(channel, message);
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
		Oxyl.bot.on("messageCreate", this.listener);
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
		Oxyl.bot.removeListener("messageCreate", this.listener);

		this.emit("end", this.collected, reason);
	}
}

exports.awaitMessages = (channel, filter, options) => {
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
	for(var i = 0; i < dirs.length; i++) {
		var files = exports.getFiles(dirs[i]);

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
	if(!dirName && !fileName) {
		return false;
	} else {
		return [dirName, fileName];
	}
};

exports.getFiles = (filePath, filter = (file) => true) => {
	var dirFiles = fs.readdirSync(filePath);
	let fullFiles = [];
	dirFiles.forEach(file => {
		var stats = fs.lstatSync(`${filePath}${file}`);
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
	for(var i in dirFiles) {
		i = dirFiles[i];
		scripts[i.substring(i.lastIndexOf("/") + 1, i.length - 3)] = exports.loadScript(i);
	}

	exports.consoleLog(`Loaded scripts at ${filePath}`);
	return scripts;
};

exports.loadScript = (scriptPath) => {
	let script = path.resolve(scriptPath);
	let cache = require.cache[require.resolve(script)];

	if(cache) delete require.cache[require.resolve(script)];
	return require(scriptPath);
};

exports.listConstructor = (obj, index, follower) => {
	var msg = "", objSize = obj.length - 1;
	for(var i = 0; i <= objSize; i++) {
		var value = obj[i];
		let addFollower = true;
		let toAdd = "", constructor = "";

		if(index && index > 0) {
			if(follower) {
				constructor = "  ".repeat(index);
				// Gets the perfect spacing
			} else {
				constructor = "║".repeat(index);
				addFollower = false;
			}
		} else {
			index = 0;
		} if(i === objSize || (Array.isArray(obj[objSize]) && i === objSize - 1)) {
			constructor += "╚";
		} else {
			constructor += "╠";
			addFollower = false;
		}

		if(Array.isArray(value)) {
			toAdd = exports.listConstructor(value, index + 1, addFollower);
		} else {
			constructor = constructor.split("").join(" ");
			toAdd = `\n **${constructor}** ${value}`;
		}

		msg += toAdd;
	}
	return msg;
};
