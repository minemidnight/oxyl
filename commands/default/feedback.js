exports.cmd = new Oxyl.Command("feedback", async message => {
	framework.consoleLog(`Feedback from ${framework.unmention(message.author)} (${message.author.id}):` +
		`${framework.codeBlock(message.argsPreserved[0])}`, "feedback");
	return "Sent feedback!";
}, {
	cooldown: 30000,
	type: "default",
	description: "Send feedback to the Support Server",
	args: [{
		type: "text",
		label: "message"
	}]
});
