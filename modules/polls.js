const Duration = require("duration-js"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const runningPolls = [], bot = Oxyl.bot;

exports.newPoll = (message, time, topic) => {
	let channel = message.channel;
	let author = message.author;
	let timeMs = time.minutes() * 60000;
	let pollResult, noVotes = 0, yesVotes = 0, id;

	let mainMsg = `:pushpin: New poll created by **${author.username}**` +
	`\n\n:paperclip: **Topic:**` +
	`\n        **╚** ${topic}`;
	let timeMsg = `\n\n:clock1030: **Time:**` +
	`\n        **╚** `;

	let durString = new Duration(timeMs).toString();
	const pollMsg = channel.sendMessage(mainMsg + timeMsg + durString);
	Promise.resolve(pollMsg).then(msg => {
		msg.react("✅");
		msg.react("❌");
		id = msg.id;
		runningPolls.push(id);
	});

	let interval = setInterval(() => {
		channel.fetchMessage(id).then(msg => {
			timeMs -= 30000;
			// 150000;
			durString = new Duration(timeMs).toString();
			yesVotes += framework.reactionCount(msg, "✅");
			noVotes += framework.reactionCount(msg, "❌");
			pollResult = `\n\n:gem: **Results:**` +
			`\n        **╠** :x: (no): ${noVotes - 1}` +
			`\n        **╚** :white_check_mark: (yes): ${yesVotes - 1}`;
			if(timeMs <= 0) {
				delete runningPolls[id];
				msg.edit(`${mainMsg}${timeMsg}:no_entry_sign: 0m0s${pollResult}\n`);
				clearInterval(interval);
			} else {
				msg.edit(`${mainMsg}${timeMsg}${durString}${pollResult}\n`);
			}
		});
	}, 30000);
	// 150000);
};

bot.on("messageReactionAdd", (reaction, user) => {
	let message = reaction.message, search;
	if(!runningPolls.includes(message.id) || user.id === bot.user.id) return;

	if(reaction.emoji.name === "✅") {
		search = "❌";
	} else {
		search = "✅";
	}

	let hasOther = message.reactions.find(reac => {
		if(!reac || !reac.emoji) {
			return false;
		} else if(reac.emoji.name === search && reac.users.find(reactionUser => reactionUser === user)) {
			return true;
		} else {
			return false;
		}
	});

	if(hasOther) hasOther.remove(user);
});
