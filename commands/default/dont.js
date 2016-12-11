const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	Jimp = require("jimp");

var command = new Command("dont", (message, bot) => {
	let user = message.author;
	let user2 = message.author;
	if(message.args[0]) user = message.args[0];
	if(message.args[1]) user2 = message.args[1];
	if(!user.avatarURL || !user2.avatarURL) return "A 'pls dont' can't be made without a avatar";
	message.channel.startTyping();

	let image = new Jimp(192, 192);
	Jimp.read(user.avatarURL).then(avatar1 => {
		image.composite(avatar1, 64, 0);

		Jimp.read(user2.avatarURL).then(avatar2 => {
			avatar2.resize(64, Jimp.AUTO);
			image.composite(avatar2, 32, 90);

			Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(font => {
				image.print(font, 8, 154, "don't talk to me or my son ever again", 184);

				image.getBuffer(Jimp.MIME_PNG, (error, buffer) => {
					message.channel.sendFile(buffer)
					.then(message.channel.stopTyping());
				});
			});
		});
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
