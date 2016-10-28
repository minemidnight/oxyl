const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("purge", "moderator", (message) => {
  var deletePerms = message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES"),
      args = message.content.split(" "),
      amt = parseInt(args[0]),
      mentions = message.mentions.users.array();
  if (!deletePerms) {
    return "Oxyl does not have permissions to delete messages.";
  } else if (isNaN(amt)) {
    return "Please provide the amount of messages you'd like to delete.";
  } else if (amt < 1) {
    return "Please provide an amount of messages to delete above 0."
  } else if (mentions.length == 0) {
    message.delete();
    message.channel.sendMessage("Purging " + amt + " messages by all users");
    message.channel.fetchMessages({limit: amt}).then(deleteMsgs => message.channel.bulkDelete(deleteMsgs));
  } else {
    message.delete();
    message.channel.sendMessage("Purging " + amt + " messages by " + mentions);
    var deleteMessages = [];
    message.channel.fetchMessages({limit: amt}).then(function(value) {
      value = value.array();
      for (var i = 0; i < value.length; i++) {
        if (mentions.includes(value[i].author)) {
          deleteMsgs.push(value[i]);
        }
        message.channel.bulkDelete(deleteMsgs);
      }
    });
  }
}, ["deletemessages"], "Delete any amount of messages by all users or a list of users (only 100 at a time)", "<amount> [mentions]");
