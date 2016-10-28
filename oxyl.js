const Discord = require("discord.js"),
      bot = new Discord.Client(),
      fs = require("fs"),
      yaml = require("js-yaml");

var ready = false;

exports.config = yaml.safeLoad(fs.readFileSync("./oxylfiles/config.yml"));
exports.defaultConfig = fs.readFileSync("./oxylfiles/default-config.yml");
exports.commands = {
  creator: {},
  default: {},
  dm: {},
  moderator: {}
};

bot.on("ready", () => {
  ready = true;
	consoleLog("```" +
  "\n* Timestamp: " + Date() +
  "\n* Guilds: " + bot.guilds.size +
  "\n* Text Channels: " + bot.channels.filter(c=>c.type === "text").size +
  "\n* Users: " + bot.users.size +
  "```", "important")
  bot.user.setGame(exports.config["messages"]["onlineGame"]);
  bot.user.setStatus("online");
	console.log("Oxyl has finished booting up and is now ready!");
});

bot.on("reconnecting", () => {
  bot.user.setGame(exports.config["messages"]["onlineGame"]);
  bot.user.setStatus("online");
  console.log("Oxyl has reconnected to Discord");``
});

exports.registerCommand = function(name, type, callback, aliases, description, usage) {
  exports.commands[type][name] = {};
  exports.commands[type][name]["aliases"] = aliases;
  exports.commands[type][name]["description"] = description;
  exports.commands[type][name]["usage"] = usage;
  exports.commands[type][name]["process"] = callback;
}

exports.loadScript = function(path) {
  var req = require(path);
  console.log("Loaded script at " + path);
};

function changeConfig(guildId, callback) {
  var path = "./oxylfiles/" + guildId + ".yml";
  var data = yaml.safeLoad(fs.readFileSync(path));
  callback();
  fs.writeFileSync(path, yaml.safeDump(data));
  consoleLog("Edited config in `" + path + "`\n\n```\n" + callback + "\n```", "debug");
}

function getConfigValue(guildId, name) {
  var path = "./oxylfiles/" + guildId + ".yml";
  var data = yaml.safeLoad(fs.readFileSync(path));
  try { return data[name]; }
  catch(err) { return; }
}

function consoleLog(message, type) {
  if (type == "important" || type == "!") {
    console.log("[!] " + message);
    var channel = "important";
  } else if (type == "dm") {
    console.log("[DM] " + message);
    var channel = "dm";
  } else if (type == "command" || type == "cmd") {
    console.log("[CMD] " + message);
    var channel = "commands";
  } else if (type == "debug") {
    if (exports.config["options"]["debugMode"]) {
      console.log("[DEBUG] " + message);
      var channel = "debug";
    }
  }
  if (channel != null) {
    if (!ready) { return; }
    channel = exports.config["channels"][channel]
    try {
      channel = bot.channels.get(channel);
    } finally {
      channel.sendMessage(message);
    }
  }
}

exports.consoleLog = consoleLog;

bot.on("channelCreate", (channel) => {
  const mutedRole = channel.guild.roles.find("name", "Muted");
  if (mutedRole) { channel.overwritePermissions(mutedRole, {SEND_MESSAGES: false}); }
});

bot.on("guildCreate", (guild) => {
  var guild_id = guild.id
  var path = "./oxylfiles/" + guild_id + ".yml";
  fs.writeFileSync(path, defaultConfig);
  consoleLog("Created YML guild config file for " + guild + "(`" + path + "`)", "debug");
  guild.owner.sendMessage("Thank you for adding Oxyl to your guild **(**" + guild.name + "**)**.\n\n" +
                           "Oxyl will be using the default configuration values. For more info, or to customly" +
                           "configure the options, run `:config " + guild.id + "` or `config: " + guild.id + "`");
});

bot.on("guildDelete", (guild) => {
  var guild_id = guild.id
  var path = "./oxylfiles/" + guild + ".yml";
  try {fs.unlinkSync(path)} catch(e) {}
  consoleLog("Deleted YML guild config file for " + guild + "(`" + path + "`)", "debug");
});

bot.on("message", (message) => {
  var cmd, cmdtype;
  if (message.author.id == exports.config["botID"]) {
    if (message.content.split(" ")[0] == "purging") { message.delete(5000); }
		return;
  } else if (message.author.bot) {
    return;
	} else {
    for (var cmd_type in exports.commands) {
      for (var loop_cmd in exports.commands[cmd_type]) {
        if (message.content.toLowerCase().lastIndexOf(exports.config["options"]["prefix"] + loop_cmd, 0) === 0 || message.content.toLowerCase().lastIndexOf(loop_cmd + exports.config["options"]["suffix"], 0) === 0) { // checks if message starts with cmd
          message.content = message.content.replace(exports.config["options"]["prefix"] + loop_cmd, "");
          message.content = message.content.replace(loop_cmd + exports.config["options"]["suffix"], ""); // remove the command from the passed message
          cmd = loop_cmd;
          cmdtype = cmd_type;
          break;
        } else {
          var aliases = exports.commands[cmd_type][loop_cmd].aliases;
          for (var i = 0; i < aliases.length; i++) {
            var alias = aliases[i];
            if (message.content.toLowerCase().lastIndexOf(exports.config["options"]["prefix"] + alias, 0) === 0 || message.content.toLowerCase().lastIndexOf(alias + exports.config["options"]["suffix"], 0) === 0) { // checks if message starts with alias
              message.content = message.content.replace(exports.config["options"]["prefix"] + alias, "");
              message.content = message.content.replace(alias + exports.config["options"]["suffix"], ""); // remove the command from the passed message
              cmd = loop_cmd;
              cmdtype = cmd_type;
              break;
            }
          }
        }
      }
    }
    message.content = message.content.indexOf(' ') == 0 ? message.content.substring(1) : message.content;
    if (cmd != null) {
      if (cmdtype == "creator") {
        if (!exports.config["creators"].includes(message.author.id)) {
          message.reply(exports.config["messages"]["notCreator"]);
          return;
        }
      } else if (cmdtype == "moderator") {
        var accepted = ["Bot Commander"], isMod;
        var roles = message.guild.member(message.author.id).roles.array();
        for (var i = 0; i < roles.length; i++) {
          if (accepted.includes(roles[i].name)) {
            isMod = true;
            break;
          }
        }
        if (!isMod) {
          message.reply(exports.config["messages"]["notMod"]);
          return;
        }
      } else if (cmdtype == "dm") {
        if (message.channel.type == "dm") {
      		consoleLog("**" + message.author.username + "** - " + message.content, "dm");
        } else {
          return;
        }
      }
      try {
        var result = exports.commands[cmdtype][cmd].process(message);
        consoleLog("[" + new Date().toTimeString() + "] " + message.author.username +
                    "#" + message.author.discriminator + " ran " + cmd, "cmd");
      } catch(error) {
        consoleLog("Failed a " + cmdtype + " command (" + cmd + ")\n" +
        "**Error:**\n```" + error + "\n```", "cmd");
      }
      if (result) {
        if (cmdtype == "dm") {
          message.author.sendMessage(result);
        } else {
          message.reply(result);
        }
      }
    }
  }
});

var commands = fs.readdirSync("./commands/");
commands.forEach(script => {
  if (script.includes(".js")) {
    exports.loadScript("./commands/" + script);
  }
});

bot.login(exports.config["token"]);
