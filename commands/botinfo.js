const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("botinfo", "default", (message, bot) => {
  return "```" +
   "\nGuilds: " + Discord.guilds.length +
   "\nChannels: " + Discord.channels.length +
   "\nUsers:" + Discord.users.length +
   "\n" +
   "\nCreator: minemidnight#1537 & TonyMaster21#8175" + 
   "\nWebsite: **N/A**" +
   "\nCommands: **N/A**" +
   "\nLibrary: Discord.JS" +
   "\nUptime: **N/A**" +
   "```";
}, [], "View lots of information about Oxyl", "[]");
