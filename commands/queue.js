const Discord = require("discord.js"),
<<<<<<< HEAD
	music = require("../modules/music.js"),
	Oxyl = require("../oxyl.js");
=======
      music = require("../modules/music.js"),
      Oxyl = require("../oxyl.js");
>>>>>>> origin/master

function getDuration(number) {
	var mins = Math.floor(number / 60);
	var secs = Math.floor(number % 60);
	if(mins < 10) {
		mins = `0${mins}`;
	} if(secs < 10) {
		secs = `0${secs}`;
	}
	return `${mins}:${secs}`;
}

Oxyl.registerCommand("queue", "default", (message, bot) => {
<<<<<<< HEAD
	var guild = message.guild;
	const ytInfo = music.data.ytinfo[guild.id];
	const queue = music.data.queue[guild.id];
	const current = music.data.current[guild.id];
	const volume = music.data.volume[guild.id];
	if(!current) {
		return `there is no music playing for **${guild.name}**`;
	} else {
		var msg = "";
		msg += `Music Info for **${guild.name}**\n`;

		var queueSize = queue.length;
		if(queueSize > 0) {
			msg += `\n**Queue (${queueSize})**`;
			for(var i = 0; i < (queueSize - 1); i++) {
				var videoId = music.getVideoId(queue[i]);
				msg += `\n **╠** **[${i + 1}]** ${ytInfo[videoId].title}`;
			}
			var lastVideoId = music.getVideoId(queue[queueSize - 1]);
			msg += `\n **╚** **[${queueSize}]** ${ytInfo[lastVideoId].title}`;
		} else {
			msg += `\n**Queue (0)**`;
			msg += `\nN/A`;
		}

		msg += `\n\n**Volume:** ${volume}`;

		var infoCurrent = ytInfo[current];
		var videoTitle = infoCurrent.title;
		var videoDuration = getDuration(infoCurrent.duration);

		var playTime = music.getPlayTime(message.guild);
		playTime = Math.floor(playTime / 1000);
		playTime = getDuration(playTime);

		msg += `\n\n**Currently Playing:** ${videoTitle} **(**${playTime}/${videoDuration}**)**`;

		return msg;
	}
=======
  var guild = message.guild;
  const ytInfo = music.data.ytinfo[guild.id];
  const queue = music.data.queue[guild.id];
  const current = music.data.current[guild.id];
  const volume = music.data.volume[guild.id];
  if (!current) {
    return `there is no music playing for **${guild.name}**`;
  } else {
    var msg = "";
    msg += `Music Info for **${guild.name}**\n`

    var queueSize = queue.length;
    if (queueSize > 0) {
      msg += `\n**Queue (${queueSize})**`;
      for(var i = 0; i < (queueSize - 1); i++) {
        var videoId = music.getVideoId(queue[i]);
        msg += `\n **╠** **[${i + 1}]** ${ytInfo[videoId]["title"]}`;
      }
      var videoId = music.getVideoId(queue[queueSize - 1]);
      msg += `\n **╚** **[${queueSize}]** ${ytInfo[videoId]["title"]}`;
    } else {
      msg += `\n**Queue (0)**`;
      msg += `\nN/A`;
    }

    msg += `\n\n**Volume:** ${volume}`;

    var infoCurrent = ytInfo[current];
    var videoTitle = infoCurrent.title;
    var videoDuration = getDuration(infoCurrent.duration);

    var playTime = music.getPlayTime(message.guild);
    playTime = Math.floor(playTime / 1000);
    playTime = getDuration(playTime);

    msg += `\n\n**Currently Playing:** ${videoTitle} **(**${playTime}/${videoDuration}**)**`

    return msg;
  }
>>>>>>> origin/master
}, ["playing", "musicinfo"], "List the current guild music queue", "[]");
