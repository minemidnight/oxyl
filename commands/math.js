const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js"),
      math = require("mathjs");

Oxyl.registerCommand("math", "default", (message, bot) => {
  var result;
  try {
    result = math.eval(message.content);
  } catch (e) {
    return "error while evaluating math expression";
    Oxyl.consoleLog("Failed math calculation `" + message.content + "`\n**Error:**\n```" + e.message + "```", "cmd");
  } finally {
    if (isNaN(parseFloat(result))) {
      return "Invalid Calculation Expression";
    } else {
      return "**Result:** " + result;
    }
  }
}, ["calc", "calculate"], "Calculate a math expression", "<expression>");
