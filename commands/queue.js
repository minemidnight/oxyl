const Discord = require("discord.js"),
      music = require("../modules/music.js"),
      ytinfo = require("youtube-video-info"),
      Oxyl = require("../oxyl.js");
const queue = music.data.queue, volume = music.data.volume;

function getDuration(number) {
  var mins = Math.floor(number / 60);
  var secs = Math.floor(number % 60);
  mins = mins < 10 ? mins = `0${mins}` : mins = mins;
  secs = secs < 10 ? secs = `0${secs}` : secs = secs;
  return `${mins}:${secs}`
}

Oxyl.registerCommand("queue", "default", (message, bot) => {
  var guild = message.guild;
  if (!queue[guild.id]) {
    return `there is no queue for **${guild.name}**`;
  } else {
    var msg = "";
    msg += `Music Info for **${guild.name}**\n`

    msg += `\n**Queue (${queue[guild.id].length})**`
    for(var i = 0; i < (queue[guild.id].length - 1); i++) {
      msg += `\n **╠** **[${i + 1}]** ${queue[guild.id][i]}`;
    } if (queue[guild.id].length > 0) {
      msg += `\n **╚** **[${queue[guild.id].length}]** ${queue[guild.id][queue[guild.id].length - 1]}`;
    }

    msg += `\n\n**Volume:** ${volume[guild.id]}`;

    var videoTitle, videoDuration;
    var info = music.getInfo(music.data.current[guild.id]).then((info) => {
      console.log(info);
      videoTitle = info.title;
      videoDuration = getDuration(info.duration);
    });
    var playTime = music.getPlayTime(message.guild);
    playTime = Math.floor(playTime / 1000);
    playTime = getDuration(playTime);

    msg += `\n\n**Currently Playing:** ${videoTitle} **(**${playTime}/${videoDuration}**)**`

    return msg;
  }
}, ["playing", "musicinfo"], "List the current guild music queue", "[]");
