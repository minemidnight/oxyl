const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("ship", async (message, bot) => {
	if(message.args[1] === undefined) message.args[1] = message.author;
	if(message.args[0] === message.args[1]) return "You must provide 2 different people to ship";
	if(message.args[2] && message.args[2].endsWith("-n")) var nicknames = true;

	let members = message.guild.members;
	let user1 = message.args[0], user2 = message.args[1];
	if(nicknames) {
		user1 = members.get(user1.id).nick || user1.username;
		user2 = members.get(user2.id).nick || user2.username;
	} else {
		user1 = user1.username;
		user2 = user2.username;
	}

	user1 = user1.substring(0, user1.length / 2);
	user2 = user2.substring(user2.length / 2);
	let shipname = user1 + user2;

	return `Your ship name is ${shipname}`;
}, {
	guildOnly: true,
	type: "default",
	description: "Create a ship name from two users, or one and yourself, add -n to use nicknames instead of usernames",
	args: [{ type: "user" }, {
		type: "user",
		optional: true
	}, {
		type: "text",
		label: "nickname flag",
		optional: true
	}]
});
