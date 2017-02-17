exports.cmd = new Oxyl.Command("customcommand", async message => {
	let cc = await framework.getCC(message.channel.guild.id, message.args[0]);
	if(cc) {
		framework.deleteCC(message.channel.guild.id, message.args[0]);
		return `Removed custom command \`${message.args[0]}\``;
	} else {
		if(!message.args[1]) return "Provide a tag to create as a custom command";
		try {
			var tag = await Oxyl.modScripts.tagModule.getTag(message.args[1], message);
		} catch(err) {
			return "No tag found";
		}

		framework.createCC(message.channel.guild.id, message.args[0], message.args[1]);
		return `Created custom command \`${message.args[0]}\` to execute tag \`${message.args[1]}\``;
	}
}, {
	guildOnly: true,
	type: "default",
	description: "Toggle a custom command which executes a tag",
	aliases: ["cc"],
	args: [{
		type: "text",
		label: "command name"
	}, {
		type: "text",
		label: "tag",
		optional: true
	}]
});
