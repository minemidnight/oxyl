const Discord = require("discord.js"),
<<<<<<< HEAD
	Duration = require("duration-js"),
	Oxyl = require("../oxyl.js");
const bot = Oxyl.bot;

var newPoll = (message, time, topic) => {
	var channel = message.channel;
	var author = message.author;
	var timeMs = time.minutes() * 60000;
	var pollResult, noVotes, yesVotes, id;

	var mainMsg = `:pushpin: New poll created by **${author.username}**` +
	`\n\n:paperclip: **Topic:**` +
	`\n				**╚** ${topic}`;
	var timeMsg = `\n\n:clock1030: **Time:**` +
	`\n				**╚** `;


	var durString = new Duration(timeMs).toString();
	const pollMsg = channel.sendMessage(mainMsg + timeMsg + durString);
	Promise.resolve(pollMsg).then(msg => {
		msg.addReaction("✅");
		msg.addReaction("❌");
		id = msg.id;
	});

	var interval = setInterval(() => {
		channel.fetchMessage(id).then(msg => {
			timeMs -= 30000;
			// 150000;
			durString = new Duration(timeMs).toString();
			yesVotes = msg.reactions.find(reac => reac.emoji.name === "✅").count - 1;
			noVotes = msg.reactions.find(reac => reac.emoji.name === "❌").count - 1;
			pollResult = `\n\n:gem: **Results:**` +
			`\n				**╠** :x: (no): ${noVotes}` +
			`\n				**╚** :white_check_mark: (yes): ${yesVotes}`;
			if(timeMsg <= 0) {
				msg.edit(`${mainMsg}${timeMsg}:no_entry_sign: 0m0s${pollResult}\n`);
				clearInterval(interval);
			} else {
				msg.edit(`${mainMsg}${timeMsg}${durString}${pollResult}\n`);
			}
		});
	}, 30000);
	// 150000);
};
=======
      Duration = require("duration-js"),
      Oxyl = require("../oxyl.js");
const bot = Oxyl.bot;

var newPoll = (message, time, topic) => {
    var channel = message.channel;
    var author = message.author;
    var timeMs = time.minutes()*60000;
    var pollResult, noVotes, yesVotes, id;

    var mainMsg = `:pushpin: New poll created by **${author.username}**` +
                  `\n\n:paperclip: **Topic:**` +
                  `\n        **╚** ${topic}`;
    var timeMsg = `\n\n:clock1030: **Time:**` +
                  `\n        **╚** `;


    var durString = new Duration(timeMs).toString();
    const pollMsg = channel.sendMessage(mainMsg + timeMsg + durString);
    Promise.resolve(pollMsg).then(msg => {
        msg.addReaction("✅");
        msg.addReaction("❌");
        id = msg.id;
    });

    var interval = setInterval(() => {
      channel.fetchMessage(id).then(msg => {
        timeMs -= 30000; //150000;
        var durString = new Duration(timeMs).toString();
        var yesVotes = msg.reactions.array().find(r => r.emoji.name === "✅").count - 1;
        var noVotes = msg.reactions.array().find(r => r.emoji.name === "❌").count - 1;
        pollResult = `\n\n:gem: **Results:**` +
           `\n        **╠** :x: (no): ${noVotes}` +
           `\n        **╚** :white_check_mark: (yes): ${yesVotes}`;
        if (timeMsg <= 0) {
          msg.edit(`${mainMsg}${timeMsg}:no_entry_sign: 0m0s${pollResult}\n`);
          clearInterval(interval);
        } else {
          msg.edit(`${mainMsg}${timeMsg}${durString}${pollResult}\n`);
        }
      });
    }, 30000); //150000);
}
>>>>>>> origin/master

exports.newPoll = newPoll;
