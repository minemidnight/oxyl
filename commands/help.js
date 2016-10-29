const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("help", "default", (message, bot) => {
  var commands = Oxyl.commands;
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
}, ["cmds", "commandlist", "commands"], "List all registered commands", "[]");
