const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	Jimp = require("jimp");

var command = new Command("hat", (message, bot) => {
	let user = message.author;
	if(message.args[0]) user = message.args[0];
	if(!user.avatarURL) return "A hat cannot be added to someone with no avatar";
	message.channel.startTyping();

	Jimp.read(user.avatarURL).then(img => {
		Jimp.read("./media/santahat.png").then(hat => {
			hat.rotate(20);
			img.composite(hat, 35, -25);
			img.resize(200, Jimp.AUTO);

			img.getBuffer(Jimp.MIME_PNG, (error, buffer) => {
				message.channel.sendFile(buffer)
				.then(message.channel.stopTyping());
			});
		});
	});
	return false;
}, {
	type: "default",
	description: "Add a hat to a user's avatar",
	args: [{
		type: "user",
		optional: true
	}]
});
