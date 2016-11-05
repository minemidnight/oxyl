const Discord = require("discord.js"),
      duration = require("duration-js"),
      Oxyl = require("../oxyl.js");
const bot = Oxyl.bot;

var newPoll = (message, timespan, topic, callback) => {
    var channel = message.channel;
    var author = message.author;
    var durationParsed = new Duration(duration);
    var timeMs = duration.minutes()*1000;
    var pollResult, noVotes, yesVotes;
    
    var mainMsg = `:pushpin: New poll created by **${author.username}**` +
                  `\n\n:paperclip: **Topic:**` +
                  `\n        **╚** ${topic}$`;
    var timeMsg = `\n\n:clock1030: **Time:**` + 
                  `\n        **╚** `;
    
    const pollMsg = channel.sendMessage(mainMsg + timeMsg);)
    Promise.resolve(pollMsg).then(msg => {
        msg.addReaction("✅"); msg.addReaction("❌");
    });

    setTimeout(() => {  
        Promise.resolve(pollMsg).then(msg => {
            yesVotes = msg.reactions["✅"].count;
            noVotes = msg.reactions["❌"].count;
            pollResult = `\n\n:gem: **Results:**` +
               `\n        **╠** :x: (no): ${noVotes}` +
               `\n        **╚** :white_check_mark: (yes): ${yesVotes}`;
            });

            msg.edit(`${mainMsg}${timeMsg}:no_entry_sign: 0m0s${pollResult}`);
        }, timeMs);  
    });
}

exports.newPoll = newPoll;
