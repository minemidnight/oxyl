const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("ban", "moderator", (message, bot) => {
  var mention = message.mentions.users.array()[0];
  var banPerms = message.guild.member(bot.user).hasPermission("BAN_MEMBERS");
  if (mention == null) {
    return "please mention the user you would like banned."
  } else {
    if (!banPerms) {
      return "Oxyl does not have permissions to ban any user."
    } else {
      var bannable = message.member.bannable;
      if (!bannable) {
        return `${mention} could not ban be banned because they have a higher role`;
      } else {
        message.guild.ban(mention);
        return `${mention} has been banned`;
      }
    }
  }
}, [], "Ban a user from the guild", "<mention>");
