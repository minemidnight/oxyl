const Discord = require("discord.js"),
      bot = new Discord.Client(),
      https = require("https"),
      math = require("mathjs"),
      fs = require("fs"),
      yaml = require("js-yaml");

var ready = false;
const config = yaml.safeLoad(fs.readFileSync("./oxylfiles/config.yml"));
const defaultConfig = fs.readFileSync("./oxylfiles/default-config.yml");

var commands = {
  default: {
    help: {
      aliases: ["cmds", "commandlist", "commands"],
      description: "List all registered commands",
      usage: "[]",
      process: function(message) {
        var cmds = {
          default: [],
          moderator: [],
          creator: [],
          dm: [],
        }

        for (var cmd_type in commands) {
          for (var loop_cmd in commands[cmd_type]) {
            cmds[cmd_type].push(loop_cmd);
            var aliases = commands[cmd_type][loop_cmd].aliases;
            for (var i = 0; i < aliases.length; i++) {
              var alias = aliases[i];
              cmds[cmd_type].push(alias);
            }
          }
        }

        for (var cmd_type in cmds) { cmds[cmd_type].sort(); }

        var defaultcmds = Object.keys(cmds["default"]).length;
        var modcmds = Object.keys(cmds["moderator"]).length;
        var creatorcmds = Object.keys(cmds["creator"]).length;
        var dmcmds = Object.keys(cmds["dm"]).length;

        return "Default Commands **(" + defaultcmds + "):** `" + cmds["default"].join("`**,** `") +
        "`\nModerator Commands **(" + modcmds + "):** `" + cmds["moderator"].join("`**,** `") +
        "`\nCreator Commands **(" + creatorcmds + "):** `" + cmds["creator"].join("`**,** `") +
        "`\nDM Commands **(" + dmcmds + "):** `" + cmds["dm"].join("`**,** `") +
        "`\nAll Commands - **" + (defaultcmds + modcmds + creatorcmds + dmcmds) + "**" +
        "\nUse `advancedhelp` to get a advanced list of commands, or cmdinfo for a detailed description of one.";
      }
    },
    advancedhelp: {
      aliases: [],
      description: "List advanced information about every registered command",
      usage: "[]",
      process: function(message) {
        var helpMsg = "";

        for (var cmd_type in commands) {
          helpMsg += "**~~——————~~** __" + cmd_type.toUpperCase() + " COMMANDS__ **~~——————~~**";
          for (var loop_cmd in commands[cmd_type]) {
            helpMsg += "```\nCommand: " + loop_cmd;
            if (commands[cmd_type][loop_cmd].aliases.length > 0) {
              helpMsg += "\nAliases: " + commands[cmd_type][loop_cmd].aliases.join(", ");
            } else {
              helpMsg += "\nAliases: N/A";
            } if (commands[cmd_type][loop_cmd].description) {
              helpMsg += "\nDescription: " + commands[cmd_type][loop_cmd].description;
            } else {
              helpMsg += "\nDescription: N/A";
            } if (commands[cmd_type][loop_cmd].usage) {
              helpMsg += "\nUsage: " + commands[cmd_type][loop_cmd].usage;
            } else {
              helpMsg += "\nUsage: N/A";
            } helpMsg += "\n```";
          }
        }
        message.author.sendMessage("**Advanced Help**\n\n" +
        "Command Prefix/Suffix (Works as either, but not both) - `:`\n" +
        helpMsg, {split: true});
        return "messaging you Oxyl's Advanced Help!";
      }
    },
    cmdhelp: {
      aliases: ["cmdinfo"],
      description: "List detailed information about a command",
      usage: "<command>",
      process: function(message) {
        var helpinfo = "", cmd = message.content.split(" ")[0], realCmd, cmdType;
        if (!cmd) { return "Please provide a command to get the information of."; }
        for (var cmd_type in commands) {
          for (var loop_cmd in commands[cmd_type]) {
              if (loop_cmd == cmd || commands[cmd_type][loop_cmd].aliases.includes(cmd)) {
                realCmd = loop_cmd, cmdType = cmd_type;
                break;
              }
          }
        }

        if (realCmd) {
          helpinfo += "info on `" + cmd + "`:\n```" +
                      "\nCommand: " + realCmd;
          helpinfo += "\nCommand Type: " + cmdType;
          if (commands[cmdType][realCmd].aliases.length > 0) {
            helpinfo += "\nAliases: " + commands[cmdType][realCmd].aliases.join(", ");
          } else {
            helpinfo += "\nAliases: N/A";
          }
          if (commands[cmdType][realCmd].description) {
            helpinfo += "\nDescription: " + commands[cmdType][realCmd].description;
          } else {
            helpinfo += "\nDescription: N/A";
          }
          if (commands[cmdType][realCmd].usage) {
            helpinfo += "\nUsage: " + commands[cmdType][realCmd].usage;
          } else {
            helpinfo += "\nUsage: N/A";
          }
          helpinfo += "\n```";
        } else {
          helpinfo = "command not found - `" + cmd + "`";
        }
        return helpinfo;
      }
    },
    math: {
      aliases: ["calc", "calculate"],
      description: "Calculate a math expression",
      usage: "<expression>",
      process: function(message) {
        var result;
        try {
          result = math.eval(message.content);
        } catch (e) {
          return "error while evaluating math expression";
          consoleLog("Failed math calculation `" + message.content + "`\n**Error:**\n```" + e.message + "```", "cmd");
        } finally {
          if (isNaN(parseFloat(result))) {
            return "Invalid Calculation Expression";
          } else {
            return "**Result:** " + result;
          }
        }
      }
    },
    uptime: {
      aliases: [],
      description: "View the current uptime of the bot",
      usage: "[]",
      process: function(message) {
        var now = Date.now();
        var msec = now - bot.readyTime;
        var days = Math.floor(msec / 1000 / 60 / 60 / 24);
        msec -= days * 1000 * 60 * 60 * 24;
        var hours = Math.floor(msec / 1000 / 60 / 60);
        msec -= hours * 1000 * 60 * 60;
        var mins = Math.floor(msec / 1000 / 60);
        msec -= mins * 1000 * 60;
        var secs = Math.floor(msec / 1000);
        var timestr = "";
        if (days > 0) {
          timestr += days + "d ";
        }
        if (hours > 0) {
          timestr += hours + "h ";
        }
        if (mins > 0) {
          timestr += mins + "m ";
        }
        if (secs > 0) {
          timestr += secs + "s ";
        }
        return "**Uptime:** " + timestr;
      }
    },
    ping: {
      aliases: [],
      description: "Test the bot's responsiveness",
      usage: "[]",
      process: function(message) {
        var time = Date.now()
        message.channel.sendMessage("Pong!").then(m => m.edit("Pong! `" + (Date.now() - time) + "ms`"));
      }
    },
    youtube: {
      aliases: ["yt"],
      description: "Search a youtube query",
      usage: "<query>",
      process: function(message) {
        var options = {
          host: "www.googleapis.com",
          path: "/youtube/v3/search?part=snippet&maxResults=1&type=video&q=" + escape(message.content) + "&key=" + googleKey
        }
        var request = https.request(options, function (res) {
          var data = "";
          res.on("data", function (chunk) {
            data += chunk;
          });
          res.on("end", function () {
            if (data.indexOf('videoId') >= 0) {
              data = JSON.parse(data)["items"][0]["id"]["videoId"];
              message.reply("here is the video you searched for: http://youtube.com/watch?v=" + data); // Manually do it because callbacks are async
            } else {
              message.reply("no results found.");
            }});
        });
        request.on("error", function (e) {
          message.reply("error while trying to contact the Youtube API"); // Manually do it because callbacks are async
          consoleLog("Failed youtube search `" + message.content + "`\n**Error:**\n```" + e.message + "```", "cmd");
        });
        request.end();
        return;
      }
    },
    support: {
      aliases: ["invite"],
      description: "Get invite link to the support guild, aswell as Oxyl's invite link",
      usage: "[]",
      process: function(message) {
        return "Support Guild: https://discord.gg/KtyNPcE" +
        "\nInvite Link: https://goo.gl/9tHfuB";
      }
    }
    // shorten: {
    //   aliases: ["shortenlink", "googl", "shortlink"],
    //   process: function(message) {
    //     var options = {
    //       host: "www.emerialnetwork.net",
    //       path: "/bot/shortenapi.php?q=" + message.content
    //     }
    //     message.reply("Link using: http://" + options["host"] + options["path"]);
    //     var request = https.request(options, function (res) {
    //       var data = "";
    //       res.on("data", function (chunk) {
    //         data += chunk;
    //       });
    //       res.on("end", function () {
    //         message.reply("here is your shortened link: " + data); // Manually do it because callbacks are async
    //       });
    //     });
    //     request.on("error", function (e) {
    //       message.reply("error while trying to contact the goo.gl API, or invalid link given."); // Manually do it because callbacks are async
    //       consoleLog("Failed goo.gl shorten `" + message.content + "`\n**Error:**\n```" + e.message + "```", "cmd");
    //     });
    //     request.end();
    //     return;
    //   }
    // }
  },
  moderator: {
    ban: {
      aliases: [],
      description: "Ban a user from the guild",
      usage: "<mention>",
      process: function(message) {
        var mention = message.mentions.users.array()[0];
        var banPerms = message.guild.member(bot.user).hasPermission("BAN_MEMBERS");
        if (mention == null) {
          return "please mention the user you would like banned."
        } else {
          if (!banPerms) {
            return "Oxyl does not have permissions to ban any user."
          } else {
            var bannable = message.guild.member(mention).bannable;
            if (!bannable) {
              return mention + " could not ban be banned because they have a higher role.";
            } else {
              message.guild.ban(mention);
              return mention + " has been banned.";
            }
          }
        }
      }
    },
    mute: {
      aliases: [],
      description: "Toggle a person's mute state in the guild (for text chat)",
      usage: "<mention>",
      process: function(message) {
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
      }
    },
    purge: {
      aliases: ["deletemessages"],
      description: "Delete any amount of messages by all users or a list of users (only 100 at a time)",
      usage: "<amount> [mentions]",
      process: function(message) {
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
      }
    },
    kick: {
      aliases: [],
      description: "Kick a user from the guild",
      usage: "<mention>",
      process: function(message) {
        var mention = message.mentions.users.array()[0];
        var kickPerms = message.guild.member(bot.user).hasPermission("KICK_MEMBERS");
        if (mention == null) {
          return "please mention the user you would like kicked."
        } else {
          if (!kickPerms) {
            return "Oxyl does not have permissions to kick any user."
          } else {
            var kickable = message.guild.member(mention).kickable;
            if (!kickable) {
              return mention + " could not ban be kicked because they have a higher role.";
            } else {
              message.guild.member(mention).kick();
              return mention + " has been kicked.";
            }
          }
        }
      }
    }
  },
  creator: {
    eval: {
      aliases: ["evaluate"],
      description: "Execute code",
      usage: "<code>",
      process: function(message) {
  			try {
  				var output = eval(message.content);
  				return "**Output:** " + output;
  			} catch (e) {
  				return "**Error:** " + e;
  			}
      }
    },
  },
  dm: {
    config: {
      aliases: ["setup"],
      description: "Configurate Oxyl and his settings per guild",
      usage: "<guild id> [option] [option]",
      process: function(message) {
        var args = message.content.split(" ");
        var guild = bot.guilds.get(args[0]);
        if (!guild) {
          return "Guild with id `" + args[0] + "` not found.";
        } else if (guild.owner.id != message.author.id) {
          return "You are not the owner of `" + guild + "` **(**" + guild.id + "**)**";
        } else {
          var path = "./oxylfiles/" + guild.id + ".yml";
          var data = yaml.safeLoad(fs.readFileSync(path));
          if (args[1] == "get") {
            var configMsg = "", cNumb = 1;
            configMsg += "Config for `" + guild + "` **(**" + guild.id + "**)**";
            configMsg += "\n```";

            if (data["channels"]["ignored"].length > 0) {
              var channelNames = [];
              for (var i = 0; i < data["channels"]["ignored"].length; i++) {
                channelNames.push(bot.channels.get(data["channels"]["ignored"][i]).name);
              }
              configMsg += "\n[" + cNumb + "] Ignored Channels: " + channelNames.sort();
            } else {
              configMsg += "\n[" + cNumb + "] Ignored Channels: None";
            } cNumb++;

            if (data["roles"]["mod"].length > 0) {
              var modRoles = [];
              for (var i = 0; i < data["roles"]["mod"].length; i++) {
                modRoles.push(guild.roles.get(data["roles"]["mod"][i]).name);
              }
              configMsg += "\n\n[" + cNumb + "] Moderator Roles: " + modRoles.sort();
            } else {
              configMsg += "\n\n[" + cNumb + "] Moderator Roles: None";
             cNumb++;

            if (data["roles"]["whitelist"].length > 0) {
              var whitelistedRoles = [];
              for (var i = 0; i < data["roles"]["whitelist"].length; i++) {
                whitelistedRoles.push(guild.roles.get(data["roles"]["whitelist"][i]).name);
              }
              configMsg += "\n[" + cNumb + "] Whitelisted Roles: " + whitelistedRoles.sort();
            } else {
              configMsg += "\n[" + cNumb + "] Whitelisted Roles: None";
            } cNumb++;

            if (data["filters"]["swear"].length > 0) {
              configMsg += "\n\n[" + cNumb + "] Swear Filter: " + data["filters"]["swear"][i].sort();
            } else {
              configMsg += "\n\n[" + cNumb + "] Swear Filter: Disabled";
            } cNumb++;

            if (data["filters"]["link"]) {
              configMsg += "\n[" + cNumb + "] Link Filter: Enabled";
            } else {
              configMsg += "\n[" + cNumb + "] Link Filter: Disabled";
            } cNumb++;

            if (data["filters"]["spam"]) {
              configMsg += "\n[" + cNumb + "] Spam Filter: Enabled";
            } else {
              configMsg += "\n[" + cNumb + "] Spam Filter: Disabled";
            } cNumb++;

            configMsg += "\n```\nTo change a value, type these arguments: `<guild id> set <number shown> <new value/reset>`";
            configMsg += "\n\n**Accepted Values for Different Types:**";
            configMsg += "\nChannels: ID or Name (not including #)";
            configMsg += "\nRoles: ID or Name";
            configMsg += "\nSwear Filter: word";
            configMsg += "\nOther Filters: on/enable/true/yes or off/disable/false/no";

            return configMsg;
          }
        } else if (args[1] == "set" || args[1] == "edit") {
          try { args[3].toLowerCase() } catch (e) { return; }
          if (args[2]) {
            var cNumb = parseInt(args[2])
            if (isNaN(cNumb)) {
              return "Invalid config ID " + cNumb + ". (Use `<guild id> get` as arguments to get the current settings and config numbers)";

            } else if (cNumb == 1) {
              var value = args[3], channel, type;
              if (!value) {
                return "Please provide a channel ID or a channel name to add to the Ignored Channels, or provide `reset` to reset it.";
              } else if (value == "reset" || value == "clear") {
                changeConfig(guild.id,
                  function() {
                    data["channels"]["ignored"] = [];
                  });
                return "Reset the Ignored Channels"
              } else if (!isNaN(parseInt(value))) {
                type = "id";
              } else {
                type = "name";
              }

              channel = guild.channels.filter(c => c.type == "text").find(type, value);
              if (!channel) {
                return "Invalid Input Value, please provide a channel ID or a channel name."
              } else {
                changeConfig(guild.id,
                  function() {
                    data["channels"]["ignored"].push(channel.id);
                  });
                return "Added " + channel + " to Ignored Channels of `" + guild + "` **(**" + guild.id + "**)**"
              }

            } else if (cNumb == 2) {
              var value = args[3], role, type;
              if (!value) {
                return "Please provide a role ID or a role name to add to the Moderator Roles, or provide `reset` to reset it.";
              } else if (value == "reset" || value == "clear") {
                changeConfig(guild.id,
                  function() {
                    data["roles"]["mod"] = [];
                  });
                return "Reset the Moderator Roles"
              } else if (!isNaN(parseInt(value))) {
                type = "id";
              } else {
                type = "name";
              }

              role = guild.roles.find(type, value);
              if (!channel) {
                return "Invalid Input Value, please provide a role ID or a role name."
              } else {
                changeConfig(guild.id,
                  function() {
                    data["roles"]["mod"].push(role.id);
                  });
                return "Added " + role.name + " to Moderator Roles of `" + guild + "` **(**" + guild.id + "**)**"
              }

            } else if (cNumb == 3) {
              var value = args[3], role, type;
              if (!value) {
                return "Please provide a role ID or a role name to add to the Whitelisted Roles, or provide `reset` to reset it.";
              } else if (value == "reset" || value == "clear") {
                changeConfig(guild.id,
                  function() {
                    data["roles"]["whitelist"] = [];
                  });
                return "Reset the Whitelisted Roles"
              } else if (!isNaN(parseInt(value))) {
                type = "id";
              } else {
                type = "name";
              }

              role = guild.roles.find(type, value);
              if (!channel) {
                return "Invalid Input Value, please provide a role ID or a role name."
              } else {
                changeConfig(guild.id,
                  function() {
                    data["roles"]["whitelist"].push(role.id);
                  });
                return "Added " + role.name + " to Whitelisted Roles of `" + guild + "` **(**" + guild.id + "**)**"
              }

            } else if (cNumb == 4) {
              var value = args[3];
              if (!value) {
                return "Please provide a word to add to the Swear Filter, or provide `reset` to reset it.";
              } else if (value == "reset" || value == "clear") {
                changeConfig(guild.id,
                  function() {
                    data["filters"]["swear"] = [];
                  });
                return "Reset the Swear Filter"
              }

              changeConfig(guild.id,
                function() {
                  data["filters"]["swear"].push(value);
                });
              return "Added `" + value + "` to Swear Filter of `" + guild + "` **(**" + guild.id + "**)**"

            } else if (cNumb == 5) {
              var value = args[3];
              if (!value) {
                return "Please provide a value for the Link Filter.";
              } else if (value == "enable" || value == "true" || value == "yes") {
                value = true;
              } else if (value == "disable" || value == "false" || value == "no") {
                value = false;
              }

              changeConfig(guild.id,
                function() {
                  data["filters"]["swear"] = (value);
                });
              return "Set Link Filter to `" + value + "` in `" + guild + "` **(**" + guild.id + "**)**"

            } else if (cNumb == 6) {
              var value = args[3];
              if (!value) {
                return "Please provide a value for the Spam Filter.";
              } else if (value == "enable" || value == "true" || value == "yes") {
                value = true;
              } else if (value == "disable" || value == "false" || value == "no") {
                value = false;
              }

              changeConfig(guild.id,
                function() {
                  data["filters"]["swear"] = (value);
                });
              return "Set Spam Filter to `" + value + "` in `" + guild + "` **(**" + guild.id + "**)**"

              } else {
                return "Provide a config ID to change. (Use `<guild id> get` as arguments to get the current settings and config numbers)";
              }
            } else {
              return "Provide a config ID to change. (Use `<guild id> get` as arguments to get the current settings and config numbers)";
            }
          } else {
            return "Argument Missing: `get` or `set`"
          }
        }
      }
    }
  }
}

bot.on("ready", () => {
  ready = true;
	consoleLog("```md" +
  "\n* Timestamp: " + Date() +
  "\n* Guilds: " + bot.guilds.size +
  "\n* Text Channels: " + bot.channels.filter(c=>c.type === "text").size +
  "\n* Users: " + bot.users.size +
  "```", "important")
  bot.user.setGame(config["messages"]["onlineGame"]);
  bot.user.setStatus("online");
	console.log("Oxyl has finished booting up and is now ready!");
});

bot.on("reconnecting", () => {
  bot.user.setGame(config["messages"]["onlineGame"]);
  bot.user.setStatus("online");
  console.log("Oxyl has reconnected to Discord");``
});

String.prototype.inList = function(list) {
  return (list.indexOf(this.toString()) != -1);
}

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
    if (config["options"]["debugMode"]) {
      console.log("[DEBUG] " + message);
      var channel = "debug";
    }
  }
  if (channel != null) {
    if (!ready) { return; }
    channel = config["channels"][channel]
    try {
      channel = bot.channels.get(channel);
    } finally {
      channel.sendMessage(message);
    }
  }
}

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

bot.on("debug", (info) => {
  if (info.toLowerCase().includes("heartbeat")) { return; }
  consoleLog("**Debug Function**\n```" + info + "\n```", "debug");
});

bot.on("guildDelete", (guild) => {
  var guild_id = guild.id
  var path = "./oxylfiles/" + guild + ".yml";
  try {fs.unlinkSync(path)} catch(e) {}
  consoleLog("Deleted YML guild config file for " + guild + "(`" + path + "`)", "debug");
});

bot.on("message", (message) => {
  var cmd, cmdtype;
  if (message.author.id == config["botID"]) {
    if (message.content.split(" ")[0] == "purging") { message.delete(5000); }
		return;
  } else if (message.author.bot) {
    return;
	} else {
    for (var cmd_type in commands) {
      for (var loop_cmd in commands[cmd_type]) {
        if (message.content.toLowerCase().lastIndexOf(config["options"]["prefix"] + loop_cmd, 0) === 0 || message.content.toLowerCase().lastIndexOf(loop_cmd + config["options"]["suffix"], 0) === 0) { // checks if message starts with cmd
          message.content = message.content.replace(config["options"]["prefix"] + loop_cmd, "");
          message.content = message.content.replace(loop_cmd + config["options"]["suffix"], ""); // remove the command from the passed message
          cmd = loop_cmd;
          cmdtype = cmd_type;
          break;
        } else {
          var aliases = commands[cmd_type][loop_cmd].aliases;
          for (var i = 0; i < aliases.length; i++) {
            var alias = aliases[i];
            if (message.content.toLowerCase().lastIndexOf(config["options"]["prefix"] + alias, 0) === 0 || message.content.toLowerCase().lastIndexOf(alias + config["options"]["suffix"], 0) === 0) { // checks if message starts with alias
              message.content = message.content.replace(config["options"]["prefix"] + alias, "");
              message.content = message.content.replace(alias + config["options"]["suffix"], ""); // remove the command from the passed message
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
        if (!(message.author.id).inList(config["creators"])) {
          message.reply(config["messages"]["notCreator"]);
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
          message.reply(config["messages"]["notMod"]);
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
        var result = commands[cmdtype][cmd].process(message);
        consoleLog("Result for " + cmd + " by " + message.author.username + ":\n\n " + result, "cmd");
      } catch(error) {
        consoleLog("Failed a " + cmdtype + " command (" + cmd + ")\n" +
        "**Error:**\n```" + error.stack + "\n```", "cmd");
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

bot.login(config["token"]);
