const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	Jimp = require("jimp");

var command = new Command("color", (message, bot) => {
	message.args[0] = message.args[0].replace(/^#/, "");
	let color = parseInt(`${message.args[0]}FF`, 16);
	if(message.args[0].length !== 6 || isNaN(color)) return "Invalid HEX color code";

	message.channel.sendTyping();
	var image = new Jimp(128, 128, color);
	image.getBuffer(Jimp.MIME_PNG, (error, buffer) => {
		message.channel.createMessage("", {
			file: buffer,
			name: "color.png"
		});
	});
	return false;
}, {
	type: "default",
	description: "Add a hat to a user's avatar",
	args: [{
		type: "text",
		label: "hex color"
	}]
});
