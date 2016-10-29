const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");
      yt = require("ytdl-core");
const bot = Oxyl.bot;

var playVideo = (url, connection) => {
  let audio = yt(url, {audioonly: true});
  const dispatcher = connnection.playStream(audio);
}

exports.playVideo = playVideo;
