exports.cmd = new Oxyl.Command("cat", async message => {
	message.channel.sendTyping();

	let body = await framework.getContent("http://random.cat/meow");
	body = JSON.parse(body);
	let buffer = await framework.getContent(body.file, { encoding: null });
	return ["", {
		file: buffer,
		name: body.file.substring(body.file.lastIndexOf("/") + 1)
	}];
}, {
	type: "default",
	description: "Grab a random cat picture from the internet"
});
