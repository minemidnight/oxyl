const Jimp = require("jimp");

exports.cmd = new Oxyl.Command("color", async message => {
	message.args[0] = message.args[0].replace(/^#/, "");
	let color = parseInt(`${message.args[0]}FF`, 16);
	if(message.args[0].length !== 6 || isNaN(color)) return "Invalid HEX color code";

	message.channel.sendTyping();
	var image = new Jimp(128, 128, color);
	image.getBuffer(Jimp.MIME_PNG, (error, buffer) => {
		if(error) {
			message.channel.createMessage("Error generating picture");
		} else {
			message.channel.createMessage("", {
				file: buffer,
				name: `${message.args[0].toUpperCase()}.png`
			});
		}
	});
	return false;
}, {
	type: "default",
	description: "Send a image in chat with a hex color",
	args: [{
		type: "text",
		label: "hex color"
	}]
});
