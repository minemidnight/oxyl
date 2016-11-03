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
  var ytInfo = music.data.ytinfo[guild.id];
  if (!music.data.current[guild.id]) {
    return `there is no music playing for **${guild.name}**`;
  } else {
    var msg = "";
    msg += `Music Info for **${guild.name}**\n`

    var queueSize = queue[guild.id].length;
    if (queueSize > 0) {
      msg += `\n**Queue (${queueSize})**`;
      for(var i = 0; i < (queueSize - 1); i++) {
        var videoId = music.getVideoId(queue[guild.id][i]);
        msg += `\n **╠** **[${i + 1}]** ${ytInfo[videoId]["title"]}`;
      }
      var videoId = music.getVideoId(queue[guild.id][queueSize - 1]);
      msg += `\n **╚** **[${queueSize}]** ${ytInfo[videoId]["title"]}`;
    } else {
      msg += `\n**Queue (0)**`;
      msg += `\nN/A`;
    }

    msg += `\n\n**Volume:** ${volume[guild.id]}`;

    var infoCurrent = ytInfo[music.data.current[guild.id]];
    var videoTitle = infoCurrent.title;
    var videoDuration = getDuration(infoCurrent.duration);

    var playTime = music.getPlayTime(message.guild);
    playTime = Math.floor(playTime / 1000);
    playTime = getDuration(playTime);

    msg += `\n\n**Currently Playing:** ${videoTitle} **(**${playTime}/${videoDuration}**)**`

    return msg;
  }
}, ["playing", "musicinfo"], "List the current guild music queue", "[]");
