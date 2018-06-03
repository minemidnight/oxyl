module.exports = {
	async run({ channel, client, guild, reply, t }) {
		if(!guild.members.get(client.user.id).permission.has("manageMessages")) {
			const msg = await reply(t("commands.purge.botNoPerms"));
			setTimeout(() => msg.delete(), 3000);
			return;
		}

		const cleaned = await channel.purge(100, msg => msg.author.id === client.user.id);

		const msg = await reply(t("commands.clean", { cleaned }));
		setTimeout(() => msg.delete(), 3000);
	},
	guildOnly: true
};
