const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	Jimp = require("jimp");

var command = new Command("discordify", async (message, bot) => {
	let image;
	message.channel.sendTyping();
	if(message.attachments.length >= 1 && message.attachments[0].height) {
		image = message.attachments[0].url;
	} else if(message.argsPreserved[0]) {
		image = await framework.getContent(message.argsPreserved[0], { encoding: null });

		let verify = image.toString("hex", 0, 4);
		if(verify !== "ffd8ffe0" || verify !== "89504e47") return "Invalid link -- not a image";
	} else {
		image = message.author.staticAvatarURL;
	}

	let discordify = await framework.getContent("http://minemidnight.work/assets/images/discordify.png", { encoding: null });
	discordify = await Jimp.read(discordify);
	image = await Jimp.read(image);
	image.scaleToFit(185, 136);
	image.composite(discordify, 0, 0);

	image.getBuffer(Jimp.MIME_PNG, (error, buffer) => {
		if(error) {
			message.channel.createMessage("Error generating picture");
		} else {
			message.channel.createMessage("", {
				file: buffer,
				name: "discordify.png"
			});
		}
	});
	return false;
}, {
	type: "default",
	description: "Create a discord logo from a link, attachment or your avatar",
	args: [{
		type: "link",
		optional: true
	}]
});
