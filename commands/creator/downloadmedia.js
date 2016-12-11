const Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	Command = require("../../modules/commandCreator.js"),
	download = require("download"),
	fs = require("fs");
const mediaPath = "./media/";

var command = new Command("downloadmedia", (message, bot) => {
  // Wrap it in a timeout to wait for embeds to load
	let embeds = message.embeds, attachments = message.attachments, url, name = message.args[0];
	setTimeout(() => {
		if(attachments.size === 0 && embeds.length === 0) {
			message.channel.sendMessage("Please attach a picture or provide a embed image");
		} else if(attachments && attachments.size > 0) {
			var attachment = attachments.first();
			if(!attachment.height) {
				message.channel.sendMessage("Make sure that your attachment is a image");
			} else {
				url = attachment.url;
			}
		} else {
			var embed = embeds[0];
			if(embed.type !== "image") {
				message.channel.sendMessage("Make sure that your embed is a image");
			} else {
				url = embed.url;
			}
		} if(!url) {
			message.channel.sendMessage("Error while processing media");
		} else {
			var ext = url.substring(url.lastIndexOf("."));
			var editMsg = message.channel.sendMessage(`Downloading \`${name}${ext}\``);
			download(url).then(data => {
				fs.writeFileSync(`${mediaPath}${name}${ext}`, data);
				Promise.resolve(editMsg).then(msg => {
					msg.edit(`Downloaded <${url}> to \`${mediaPath}${name}${ext}\``);
				});
			});
		}
	}, 1000);
}, {
	type: "creator",
	description: "Download a peice of media for the media command",
	args: [{
		type: "text",
		label: "name"
	}, {
		type: "custom",
		label: "attachment/embed image"
	}]
});
