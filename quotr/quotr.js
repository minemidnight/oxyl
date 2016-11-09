const Discord = require("discord.js");
const prefix = "⭐";
const	star = "⭐";
const	bot = new Discord.Client();
const starred = [];

function getQuoteChannel(guild) {
	var quoteChannel = guild.channels.find(ch => ch.name.includes("quote"));
	return quoteChannel;
}

function getNeeded(guild) {
	const members = guild.members;

	let dndAmt = members.filter(gMem => gMem.presence.status === "dnd").size;
	let onlineAmt = members.filter(gMem => gMem.presence.status === "online").size;
	let availableAmt = dndAmt + onlineAmt;

	let neededOnline = (availableAmt ^ 2 / members.size) * availableAmt / 2 / members.size;
	if(neededOnline < 2) {
		neededOnline = 2;
	}
	return Math.round(neededOnline);
}

function formatDate(toFormat) {
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
}

function quoteMessage(message) {
	if(starred[message.id]) {
		return;
	}
	starred[message.id] = true;
	const guild = message.guild;
	const quoteChannel = getQuoteChannel(guild);

	var quoteContent = `**${message.author.username}#${message.author.discriminator}**`;
	quoteContent += ` in ${message.channel.name}`;
	quoteContent += `\n__*On ${formatDate(message.createdAt)}*__`;
	quoteContent += `\n\n${message.content}`;
	quoteChannel.sendMessage(quoteContent).then(quoteMsg => quoteMsg.addReaction(star));
}

bot.on("message", message => {
	const guild = message.guild;
	const channel = message.channel;
	const quoteChannel = getQuoteChannel(guild);

	if(channel.type !== "text") {
		return;
	} else if(message.author.id === bot.user.id && channel !== quoteChannel) {
		message.delete(5000);
	} else if(message.author.bot) {
		return;
	}

	if(message.content.startsWith(prefix)) {
		message.content = message.content.replace(`${prefix} `, `${prefix}`);
		message.content = message.content.slice(prefix.length);
	} else {
		return;
	}

	var filter = "\\d+";
	filter = new RegExp(filter);
	message.delete();

	if(message.content === "needed") {
		message.reply(`${getNeeded(guild)} :star: reactions to automatically star a message in this guild.`);
	} else if(!filter.test(message.content)) {
		message.reply(`invalid message ID.`);
	} else {
		channel.fetchMessage(message.content).then(msg => {
			quoteMessage(msg);
		}).catch(() => {
			message.reply(`message not found. Please make sure you run this in the channel the message was posted`);
		});
	}
});

bot.on("messageReactionAdd", (reaction, user) => {
	const guild = reaction.message.guild;
	const channel = reaction.message.channel;
	const quoteChannel = getQuoteChannel(guild);
	const neededOnline = getNeeded(guild);

	let isStar = reaction.emoji.name === star;
	let isQuoteChannel = channel.id === quoteChannel.id;

	if(!isStar && isQuoteChannel) {
		reaction.remove(user);
	} else if(isStar && !isQuoteChannel && reaction.count >= neededOnline) {
		quoteMessage(reaction.message);
	}
});

bot.on("ready", () => {
	console.log("Quotr has started.");
});

bot.login("MjQ0NjE0ODQ0OTkxNTM3MTU0.CwAG9Q.4AK7triozKsB-nZcIoyhqZ5AE18");
