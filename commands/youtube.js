const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js"),
      https = require("https");
const config = Oxyl.config;

Oxyl.registerCommand("youtube", "default", (message, bot) => {
  if (!message.content) {
    return "please provide a query to search for";
  } else {

  }
  var options = {
    host: "www.googleapis.com",
    path: `/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${escape(message.content)}&key=${config["googleKey"]}`
  }
  var request = https.request(options, function (res) {
    var data = "";
    res.on("data", function (chunk) {
      data += chunk;
    });
    res.on("end", function () {
      if (data.indexOf('videoId') >= 0) {
        data = JSON.parse(data)["items"][0]["id"]["videoId"];
        message.reply(`here is the video you searched for: http://youtube.com/watch?v=${data}`); // Manually do it because callbacks are async
      } else {
        message.reply("no results found.");
      }});
  });
  request.on("error", function (e) {
    message.reply("error while trying to contact the Youtube API"); // Manually do it because callbacks are async
    Oxyl.consoleLog("Failed youtube search `" + message.content + "`\n**Error:**\n```" + e.message + "```", "cmd");
  });
  request.end();
}, ["yt"], "Search a youtube query", "<query>");
