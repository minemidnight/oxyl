exports.cmd = new Oxyl.Command("clapify", async message => {
	let replaced = message.argsPreserved[0].replace(/ /g, " :clap: ");
	return `:clap: ${replaced} :clap:`;
}, {
	type: "default",
	description: "Repeat a clap emoji every space of your message",
	args: [{ type: "text" }]
});
