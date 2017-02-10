exports.cmd = new Oxyl.Command("purge", async message => {
	let deletePerms = message.channel.guild.members.get(bot.user.id).permission.has("manageMessages"),
		mentions = message.mentions;
	if(!deletePerms) {
		let msg = await message.channel.createMessage("Oxyl does not have permissions to delete messages");
		setTimeout(() => msg.delete(), 3000);
	} else {
		await message.delete();

		message.channel.purge(message.args[0], msg => {
			if(mentions && mentions.length >= 1 && mentions.indexOf(msg.author) !== -1) return true;
			else if(!mentions || mentions.length === 0) return true;
			else return false;
		});
	}

	return false;
}, {
	perm: "manageMessages",
	guildOnly: true,
	type: "moderator",
	aliases: [],
	description: "Delete up to 2500 messages by all users or a list of users",
	args: [{
		type: "int",
		min: 1,
		max: 2500,
		label: "amount"
	}, {
		type: "custom",
		optional: true,
		label: "mentions"
	}]
});
