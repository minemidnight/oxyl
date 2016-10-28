const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("cmdinfo", "default", (message) => {
  var helpinfo = "", cmd = message.content.split(" ")[0], realCmd, cmdType, commands = Oxyl.commands;
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
}, ["cmdinfo"], "List detailed information about a command", "<command>");
