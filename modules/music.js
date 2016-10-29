const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");
      yt = require("ytdl-core");
const bot = Oxyl.bot;

var playVideo = (url, connection) => {
  let stream = yt(url, {audioonly: true});
  const dispatcher = connnection.playStream(stream);
  dispatcher.on("end", () => {
    voiceChannel.leave();
  });
}

exports.playVideo = playVideo;
