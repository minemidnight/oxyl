const Discord = require("discord.js"),
      music = require("../modules/music.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("play", "default", (message, bot) => {
  var filter = "(?:http://)?(?:www.)?(?:youtube.com|youtu.be)/(?:watch\?)?([^\s]+?)";
  filter = new RegExp(filter);
  var voiceChannel = message.member.voiceChannel;
  if (!message.content) {
    return "please provide a youtube link to play";
  } else if (!filter.test(message.content)) {
    return "invalid link given, please only use youtube links";
  } else if (!voiceChannel) {
    return "please be in a voice channel";
  } else if (!voiceChannel.joinable) {
    return "I cannot join that voice channel due to permissions";
  } else {
    voiceChannel.join().then(connection => {
      music.addQueue(message.content, message.guild, connection);
    });
    return `Added \`${message.content}\` to **${message.guild.name}**'s queue`;
  }
}, [], "Add a youtube video to the music queue", "<yt link>");
