exports.cmd = new Oxyl.Command("ping", async message => {
	let time = Date.now();
	let msg = await message.channel.createMessage("Pong!");
	msg.edit(`Pong! \`${Date.now() - time}ms\``);
}, {
	type: "default",
	description: "Test the bot's responsiveness"
});
