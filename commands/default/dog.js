const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("dog", (message, bot) => {
	message.channel.sendTyping();

	framework.getContent("http://random.dog/woof").then(body => {
		framework.getContent(`http://random.dog/${body}`, { encoding: null }).then(buffer => {
			message.channel.createMessage("", {
				file: buffer,
				name: body
			});
		});
	});
}, {
	type: "default",
	description: "Grab a random dog picture from the internet"
});
