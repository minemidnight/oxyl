const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("cat", (message, bot) => {
	message.channel.sendTyping();

	framework.getContent("http://random.cat/meow").then(body => {
		body = JSON.parse(body);
		framework.getContent(body.file, { encoding: null }).then(buffer => {
			message.channel.createMessage("", {
				file: buffer,
				name: body.file.substring(body.file.lastIndexOf("/") + 1)
			});
		});
	});
}, {
	type: "default",
	description: "Grab a random cat picture from the internet"
});
