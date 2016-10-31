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
    helpInfo += `info on ${cmd}` +
                `\nCommand: ${realCmd}` +
                `\n **╠** Command Type: ${cmdType}`;
    if (commands[cmdType][realCmd].aliases.length > 0) {
      helpInfo += `\n **╠** Aliases: ${commands[cmdType][realCmd].aliases.join(", ")}`;
    } else {
      helpInfo += "\n **╠** Aliases: N/A";
    }
    if (commands[cmdType][realCmd].description) {
      helpInfo += `\n **╠** Description: ${commands[cmdType][realCmd].description}`;
    } else {
      helpInfo += "\n **╠** Description: N/A";
    }
    if (commands[cmdType][realCmd].usage) {
      helpInfo += `\n **╚** Usage: ${commands[cmdType][realCmd].usage}`;
    } else {
      helpInfo += "\n **╚** Usage: N/A";
    }
  } else {
    helpInfo = "Command not found - `" + cmd + "`";
    helpInfo = `Command not found - \`${cmd}\``
  }
  return helpInfo;
}, ["cmdhelp"], "List detailed information about a command", "<command>");
