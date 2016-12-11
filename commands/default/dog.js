const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("dog", (message, bot) => {
	message.channel.startTyping();

	let options = {
		host: "random.dog",
		path: "/woof"
	};

	framework.getHTTP(options).then(body => {
		message.channel.sendFile(`http://random.dog/${body}`)
		.then(message.channel.stopTyping());
	});
}, {
	type: "default",
	description: "Grab a random dog picture from the internet"
});
