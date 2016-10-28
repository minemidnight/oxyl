const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js"),
      https = require("https");

Oxyl.registerCommand("shorten", "default", (message) => {
  var options = {
    host: "www.emerialnetwork.net",
    path: "/bot/shortenapi.php?q=" + message.content
  }
  message.reply("Link using: http://" + options["host"] + options["path"]);
  var request = https.request(options, function (res) {
    var data = "";
    res.on("data", function (chunk) {
      data += chunk;
    });
    res.on("end", function () {
      message.reply("here is your shortened link: " + data); // Manually do it because callbacks are async
    });
  });
  request.on("error", function (e) {
    message.reply("error while trying to contact the goo.gl API, or invalid link given."); // Manually do it because callbacks are async
    consoleLog("Failed goo.gl shorten `" + message.content + "`\n**Error:**\n```" + e.message + "```", "cmd");
  });
  request.end();
}, ["shortenlink", "googl", "shortlink"], "Shorten a link using goo.gl", "<link>");
