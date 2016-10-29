const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");
const commands = Oxyl.commands;

Oxyl.registerCommand("advancedhelp", "default", (message, bot) => {
  var helpMsg = "";

  for (var cmdType in commands) {
    helpMsg += `**~~——————~~** __${cmdType.toUpperCase()} COMMANDS__ **~~——————~~**`;
    for (var loopCmd in commands[cmdType]) {
      helpMsg += "```\nCommand: " + loopCmd;
      if (commands[cmdType][loopCmd].aliases.length > 0) {
        helpMsg += `\nAliases: ${commands[cmdType][loopCmd].aliases.join(", ")}`;
      } else {
        helpMsg += "\nAliases: N/A";
      } if (commands[cmdType][loopCmd].description) {
        helpMsg += `\nDescription: ${commands[cmdType][loopCmd].description}`;
      } else {
        helpMsg += "\nDescription: N/A";
      } if (commands[cmdType][loopCmd].usage) {
        helpMsg += `\nUsage: ${commands[cmdType][loopCmd].usage}`;
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
