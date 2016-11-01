const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js"),
      https = require("https"),
      yt = require("ytdl-core");
const bot = Oxyl.bot, config = Oxyl.config;
var defaultVolume = 15;
var data = {queue: {}, current: {}, volume: {}};

var getInfo = (videoId) => {
  var options = {
    host: "www.googleapis.com",
    path: `/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&fields=items(snippet(title),contentDetails(duration))&key=${config["googleKey"]}`
  }
  return new Promise((resolve, reject) => {
    var request = https.request(options, function (res) {
      var data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on("end", function () {
        console.log(data);
        var info = JSON.parse(data)["items"];
        var returnData = {};
        returnData.push(info["contentDetails"]["duration"]);
        returnData.push(info["snippet"]["title"]);
        resolve(returnData);
      });
      res.on("error", function () {
        reject("Error during https request");
      });
    });
    request.end();
  });
}

var voiceCheck = (guildMember) => { //Use to assure user is in channel
  var guild = guildMember.guild;
  if (guild.voiceConnection.channel.id !== guildMember.voiceChannel.id) {
    return false;
  } else {
    return guildMember.voiceChannel;
  }
}

var getPlayTime = (guild) => {
  return getDispatcher(guild).time;
}

var processQueue = (guild, connection) => {
  var dispatcher = getDispatcher(guild);
  var queue = data.queue;
  var current = data.current;
  var volume = data.volume;
  if (!dispatcher && queue[guild.id].length > 0) {
    playVideo(queue[guild.id][0], guild, connection);
    queue[guild.id].splice(0);
  } else if (dispatcher && queue[guild.id].length <= 0) {
    connection.disconnect();
    delete(queue[guild.id]);
    delete(volume[guild.id]);
    delete(current[guild.id]);
  }
}

var addQueue = (url, guild, connection) => {
  if (!connection) {connection = guild.voiceConnection;}
  var queue = data.queue;
  if (!queue[guild.id]) {
    queue[guild.id] = [];
  }
  queue[guild.id].push(url);
  processQueue(guild, connection);
}

var endStream = (guild) => {
  var connetion = getDispatcher(guild);
  if (!connection) { return; }

  connection.end()
}

var pauseStream = (guild) => {
  var connetion = getDispatcher(guild);
  if (!connection) { return; }

  connection.pause()
}

var resumeStream = (guild) => {
  var connetion = getDispatcher(guild);
  if (!connection) { return; }

  connection.resume()
}

var setVolume = (guild, newVolume) => {
  var connection = getDispatcher(guild);
  var volume = data.volume;
  if (newVolume > 100) {
    newVolume = 100;
  } else if (newVolume < 0) {
    newVolume = 0;
  }
  if (!connection) { return; }

  connection.setVolume(newVolume/250);
  volume[guild.id] = newVolume;
}

var leaveVoice = (guild) => {
  guild.voiceConnection.disconnect();
}

var getDispatcher = (guild) => {
  return guild.voiceConnection.player.dispatcher;
}

var playVideo = (url, guild, connection) => {
  var queue = data.queue;
  var volume = data.volume;
  var current = data.current;
  if (!volume[guild.id]) {
    volume[guild.id] = defaultVolume;
  }
  var playVolume = volume[guild.id]/250;

  let stream = yt(url, {audioonly: true});
  var video_id = url.split("v=")[1];
  var ampersandPosition = video_id.indexOf("&");
  if (ampersandPosition != -1) {
    video_id = video_id.substring(0, ampersandPosition);
  }
  current[guild.id] = video_id;
  const dispatcher = connection.playStream(stream, {volume: playVolume});
  dispatcher.on("end", () => {
    delete(current[guild.id]);
    setTimeout(() => {processQueue(guild, connection);}, 100);
  });
}


exports.getInfo = getInfo;
exports.voiceCheck = voiceCheck;
exports.getPlayTime = getPlayTime;
exports.processQueue = processQueue;
exports.data = data;
exports.addQueue = addQueue;
exports.endStream = endStream;
exports.pauseStream = pauseStream;
exports.resumeStream = resumeStream;
exports.setVolume = setVolume;
exports.leaveVoice = leaveVoice;
exports.getDispatcher = getDispatcher;
exports.playVideo = playVideo;
