const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js"),
      fs = require("fs");

var mediaPath = "./media/";

Oxyl.registerCommand("listmedia", "default", (message, bot) => {
  var media = fs.readdirSync(`${mediaPath}`), mediaList = [];
  media.forEach(m => {
    var extIndex = m.lastIndexOf(".");
    var base = m.substring(0, extIndex); //get base name (no extension)
    mediaList.push(base)
  });
  mediaList = mediaList.sort();
  return `all media **(**${mediaList.length}**)**:` +
         "\n```\n" +
         `${mediaList.join(", ")}` +
         "\n```";
}, ["sharelist"], "List all shareable media", "[]");
