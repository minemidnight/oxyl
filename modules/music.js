const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");
      yt = require("ytdl-core");
const bot = Oxyl.bot;
var defaultVolume = 15;
var data = {queue: {}, playing: {}, volume: {}};

var processQueue = (guild, connection) => {
  var playing = data.playing;
  var queue = data.queue;
  if (!playing[guild.id] && queue[guild.id].length > 0) {
    playVideo(queue[guild.id][0], guild, connection);
    queue[guild.id].splice(0);
  }
}

var addQueue = (url, guild, connection) => {
  if (!connection) {connection = guild.voiceConnection;}
  var playing = data.playing;
  var queue = data.queue;
  if (!queue[guild.id]) {
    queue[guild.id] = [];
  }
  queue[guild.id].push(url);
  processQueue(guild, connection);
}

var endStream = (guild) => {
  var connetion = data.playing;
  if (!data.playing[guild.id]) { return; }

  playing[guild.id].end()
}

var pauseStream = (guild) => {
  var connetion = data.playing;
  if (!data.playing[guild.id]) { return; }

  playing[guild.id].pause()
}

var resumeStream = (guild) => {
  var connetion = data.playing;
  if (!data.playing[guild.id]) { return; }

  playing[guild.id].resume()
}

var setVolume = (guild, newVolume) => {
  var connetion = data.playing;
  var volume = data.volume;
  if (newVolume > 100) {
    newVolume = 100;
  } else if (newVolume < 0) {
    newVolume = 0;
  }
  if (!data.playing[guild.id]) { return; }

  getDispatcher(guild).setVolume(newVolume/250);
  volume[guild.id] = newVolume;
}

var leaveVoice = (guild) => {
  guild.voiceConnection.disconnect();
}

var getDispatcher = (guild) => {
  return guild.voiceConnection.player.dispatcher;
}

var playVideo = (url, guild, connection) => {
  var playing = data.playing;
  var queue = data.queue;
  var volume = data.volume;
  if (!volume[guild.id]) {
    volume[guild.id] = defaultVolume;
  }
  var playVolume = volume[guild.id]/250;

  let stream = yt(url, {audioonly: true});
  const dispatcher = connection.playStream(stream, {volume: playVolume});
  playing[guild.id] = true;
  dispatcher.on("end", () => {
    delete(playing[guild.id]);
    setTimeout(() => {processQueue(guild, connection);}, 100)
  });
}

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
