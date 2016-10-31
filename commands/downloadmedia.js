const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js"),
      download = require("download"),
      fs = require("fs");

// Uses message.reply because it must wait for Discord to load embeds

var mediaPath = "./media/";

Oxyl.registerCommand("downloadmedia", "creator", (message, bot) => {
  setTimeout(() => { //Wrap it in a timeout to wait for embeds to load
    var embeds = message.embeds, attachments = message.attachments, url,
        name = message.content.split(" ")[0];
    if (!name) {
      message.reply("please provide a name for the media");
    } else if (attachments.size === 0  && embeds.length === 0) {
      message.reply("please attach a picture or provide a embed image");
    } else if (attachments.size) {
      var attachment = attachments.first();
      if (!attachment.height) {
        message.reply("make sure that your attachment is a image");
      } else {
        url = attachment.url;
      }
    } else {
      embed = embeds[0];
      if (embed.type !== "image") {
        message.reply("make sure that your embed is a image");
      } else {
        url = embed.url;
      }
    } if (!url) {
      message.reply("error while processing media");
    } else {
      var ext = url.substring(url.lastIndexOf("."));
      download(url).then(data => {
        fs.writeFileSync(`${mediaPath}${name}${ext}`, data);
      })
      message.reply(`downloaded ${url} to \`${mediaPath}${name}${ext}\``);
    }
  }, 1000);
}, ["mediadownload"], "Download a piece of media for the media command", "<name> <attachment/embed image>");
