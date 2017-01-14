const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	Jimp = require("jimp");

var command = new Command("dont", async (message, bot) => {
	let user = message.args[0] || message.author;
	let user2 = message.args[1] || message.author;
	message.channel.sendTyping();

	let image = new Jimp(192, 192);
	let avatar1 = await Jimp.read(user.staticAvatarURL);
	let avatar2 = await Jimp.read(user.staticAvatarURL);
	image.composite(avatar1, 64, 0);
	avatar2.resize(64, Jimp.AUTO);
	image.composite(avatar2, 32, 90);

	let font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
	image.print(font, 8, 154, "don't talk to me or my son ever again", 184);

	image.getBuffer(Jimp.MIME_PNG, (error, buffer) => {
		if(error) {
			return "Error generating picture";
		} else {
			return ["", {
				file: buffer,
				name: "dont.png"
			}];
		}
	});
	return false;
}, {
	type: "default",
	description: "Create a ship name from two users, or one and yourself",
	args: [{
		type: "user",
		optional: true
	}, {
		type: "user",
		optional: true
	}]
});
