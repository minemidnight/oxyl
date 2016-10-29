const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("cmdinfo", "default", (message, bot) => {
  var helpInfo = "", cmd = message.content.split(" ")[0], realCmd, cmdType, commands = Oxyl.commands;
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
    helpInfo += "info on `" + cmd + "`:\n```";
    helpInfo += `\nCommand: ${realCmd}`;
    helpInfo += `\nCommand Type: ${cmdType}`;
    if (commands[cmdType][realCmd].aliases.length > 0) {
      helpInfo += `\nAliases: ${commands[cmdType][realCmd].aliases.join(", ")}`;
    } else {
      helpInfo += "\nAliases: N/A";
    }
    if (commands[cmdType][realCmd].description) {
      helpInfo += `\nDescription: ${commands[cmdType][realCmd].description}`;
    } else {
      helpInfo += "\nDescription: N/A";
    }
    if (commands[cmdType][realCmd].usage) {
      helpInfo += `\nUsage: ${commands[cmdType][realCmd].usage}`;
    } else {
      helpInfo += "\nUsage: N/A";
    }
    helpInfo += "\n```";
  } else {
    helpInfo = "Command not found - `" + cmd + "`";
    helpInfo = `Command not found - \`${cmd}\``
  }
  return helpInfo;
}, ["cmdhelp"], "List detailed information about a command", "<command>");
