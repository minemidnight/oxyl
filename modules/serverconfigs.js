const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.bot.on("guildCreate", (guild) => {
  var guild_id = guild.id
  var path = "../server-configs/" + guild_id + ".yml";
  fs.writeFileSync(path, defaultConfig);
  Oxyl.consoleLog("Created YML guild config file for " + guild + "(`" + path + "`)", "debug");
  guild.owner.sendMessage("Thank you for adding Oxyl to your guild **(**" + guild.name + "**)**.\n\n" +
                           "Oxyl will be using the default configuration values. For more info, or to customize" +
                           "configuration options, run `:config " + guild.id + "` or `config: " + guild.id + "`");
});

Oxyl.bot.on("guildDelete", (guild) => {
  var guild_id = guild.id
  var path = "../server-configs/" + guild + ".yml";
  try {fs.unlinkSync(path)} catch(e) {}
  Oxyl.consoleLog("Deleted YML guild config file for " + guild + "(`" + path + "`)", "debug");
});
