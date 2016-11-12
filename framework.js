const Oxyl = require("./oxyl.js");
const	fs = require("fs");
const	yaml = require("js-yaml");

exports.config = yaml.safeLoad(fs.readFileSync("./private/config.yml"));
exports.defaultConfig = fs.readFileSync("./private/default-config.yml");
exports.commands = {};

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

exports.loadScript = (path, reload) => {
	require(path);
	if(reload) {
		exports.consoleLog(`Reloaded script at ${path}`, "debug");
	} else {
		exports.consoleLog(`Loaded script at ${path}`, "debug");
	}
};

exports.codeBlock = (content) => {
	let returnVal = "\n```\n";
	returnVal += content;
	returnVal += "\n```";
	return returnVal;
};

exports.consoleLog = (message, type) => {
	var channel;
	if(type === "important") {
		console.log(`[!] ${message}`);
		channel = "important";
	} else if(type === "dm") {
		console.log(`[DM] ${message}`);
		channel = "dm";
	} else if(type === "command" || type === "cmd") {
		console.log(`[CMD] ${message}`);
		channel = "commands";
	} else if(type === "debug") {
		console.log(`[DEBUG] ${message}`);
		channel = "debug";
	}
	channel = exports.config.channels[channel];
	channel = Oxyl.bot.channels.get(channel);
	if(channel) {
		channel.sendMessage(message);
	}
};

exports.loadScripts = (path) => {
	var dirFiles = fs.readdirSync(path);
	dirFiles.forEach(script => {
		var stats = fs.lstatSync(`${path}${script}`);
		if(stats.isDirectory()) {
			exports.loadScripts(`${path}${script}/`);
		} else if(script.endsWith(".js")) {
			exports.loadScript(`${path}${script}`);
		}
	});
};

exports.changeConfig = (guildId, callback) => {
	var path = `./server-configs/${guildId}.yml`;
	var data = yaml.safeLoad(fs.readFileSync(path));
	fs.writeFileSync(path, yaml.safeDump(data));
	exports.consoleLog(`Edited config in \`${path}\`\n\n\`\`\`\n${callback}\n\`\`\``, "debug");
	return callback();
};

exports.getConfigValue = (guildId, name) => {
	var path = `./server-configs/${guildId}.yml`;
	var data = yaml.safeLoad(fs.readFileSync(path));
	return data[name];
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
			toAdd = exports.createList(value, index + 1, addFollower);
		} else {
			constructor = constructor.split("").join(" ");
			toAdd = `\n **${constructor}** ${value}`;
		}

		msg += toAdd;
	}
	return msg;
};

exports.registerCommand = Oxyl.registerCommand;
