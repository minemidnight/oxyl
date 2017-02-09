exports.cmd = new Oxyl.Command("dog", async message => {
	message.channel.sendTyping();

	let body = await framework.getContent("http://random.dog/woof");
	let buffer = await framework.getContent(`http://random.dog/${body}`, { encoding: null });
	return ["", {
		file: buffer,
		name: body
	}];
}, {
	type: "default",
	description: "Grab a random dog picture from the internet"
});
