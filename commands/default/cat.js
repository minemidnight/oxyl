const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("cat", (message, bot) => {
	message.channel.startTyping();

	let options = {
		host: "random.cat",
		path: "/meow"
	};

	framework.getHTTP(options).then(body => {
		body = JSON.parse(body);
		message.channel.sendFile(body.file)
		.then(msg => message.channel.stopTyping());
	});
}, {
	type: "default",
	description: "Grab a random cat picture from the internet"
});
