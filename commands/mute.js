const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("mute", "moderator", (message) => {
  var mention = message.mentions.users.array()[0];
  var isMuted = message.guild.member("155112606661607425").roles.find("name", "Muted");
  var rolePerms = message.guild.member(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS");
  if (mention == null) {
    return "please mention the user you would like muted."
  } else {
    if (!mutedRole && !rolePerms) {
      return "Oxyl does not have the permission to create and configure the muted role.";
    } else if (!message.guild.roles.find("name", "Muted")) {
      message.guild.createRole({name: "Muted", color: "#DF4242", permissions: []})
        .then(function(role) {
                var channels = message.guild.channels.filter(c=>c.type === "text").array()
                for (var i = 0; i < channels.length; i++) {
                  channels[i].overwritePermissions(role, {SEND_MESSAGES: false});
                }
              });
    } if (!rolePerms) {
      return "Oxyl does not have permissions to mute any user."
    } else {
      var mutedRole = message.guild.roles.find("name", "Muted");
      if (isMuted) {
        message.guild.member(mention).removeRole(mutedRole);
        return mention + " has been unmuted.";
      } else {
        message.guild.member(mention).addRole(mutedRole);
        return mention + " has been muted.";
      }
    }
  }
}, [], "Toggle a person's mute state in the guild (for text chat)", "<mention>");
