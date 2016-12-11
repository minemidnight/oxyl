const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("ship", (message, bot) => {
	if(message.args[1] === undefined) message.args[1] = message.author;
	if(message.args[0] === message.args[1]) return "You cannot ship the same person";

	message.args.sort();
	let user1 = message.args[0].username;
	user1 = user1.substring(0, user1.length / 2);
	let user2 = message.args[1].username;
	user2 = user2.substring(user2.length / 2);
	let shipname = user1 + user2;

	return `Your ship name is ${shipname}`;
}, {
	type: "default",
	description: "Create a ship name from two users, or one and yourself",
	args: [{ type: "user" }, {
		type: "user",
		optional: true
	}]
});
