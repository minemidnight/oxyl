const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("advancedhelp", "default", (message) => {
  var helpMsg = "", commands = Oxyl.commands;

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
}, [], "List advanced information about every registered command", "[]")
