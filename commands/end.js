const Discord = require("discord.js"),
      music = require("../modules/music.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("stop", "default", (message, bot) => {
  var voice = music.voiceCheck(message.member);
  if (!voice) {
    return "you and Oxyl must both be in the same channel to stop the music";
  } else {
    music.pauseStream(message.guild);
    return `paused the music in ${voice.name}`;
  }
}, ["end"], "Pause the music in your channel", "[]");
