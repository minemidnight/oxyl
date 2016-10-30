const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js"),
      fs = require("fs");

var mediaPath = "./media/"

function checkMedia(name) {
  var media = fs.readdirSync(`${mediaPath}`), mediaExt;
  media.forEach(m => {
    var extIndex = m.lastIndexOf(".");
    var base = m.substring(0, extIndex); //get base name (no extension)
    var ext = m.substring(extIndex + 1); //get extension without .
    if (base === name) {
      mediaExt = ext;
    }
  });
  return mediaExt;
}

Oxyl.registerCommand("media", "default", (message, bot) => {
  if (!message.content) {
    return "please provide a media to share, run listmedia to list all media";
  } else {
    var ext = checkMedia(message.content);
    if (!ext) {
      return `invalid media: \`${message.content}\`, run listmedia to list all media`;
    } else {
      message.channel.sendFile(`${mediaPath}${message.content}.${ext}`, `${message.content}.${ext}`);
    }
  }
}, ["share"], "Share a peice of media", "<media name>");
