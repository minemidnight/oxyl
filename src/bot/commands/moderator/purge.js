const linkFilter = /^((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/im; // eslint-disable-line max-len
const filters = {
	bots: msg => msg.author.bot,
	images: msg => msg.attachments[0] && msg.attachments[0].width,
	files: msg => msg.attachments[0] && !msg.attachments[0].width,
	embeds: msg => msg.embeds.length,
	links: msg => linkFilter.test(msg.content),
	from: (msg, users) => ~users.indexOf(msg.author.id),
	includes: (msg, content) => ~msg.content.indexOf(content),
	matches: (msg, regex) => regex.test(msg.content)
};

module.exports = {
	async run({
		args: [limit], author, channel, client, flags, guild,
		message: { member: authorMember }, message, reply, t, wiggle
	}) {
		if(!guild.members.get(client.user.id).permission.has("manageMessages")) {
			const msg = await reply(t("commands.purge.botNoPerms"));
			setTimeout(() => msg.delete(), 3000);
			return;
		}

		await message.delete();

		if(flags.from) flags.from = flags.from.map(({ id }) => id);
		if(flags.matches) flags.matches = new RegExp(flags.matches, "im");

		const activeFilters = Object.entries(flags)
			.filter(([key, value]) => value && filters[key])
			.map(([key, value]) => ({ verify: filters[key], value }));

		if(flags.inverse) {
			activeFilters.forEach(filter => {
				const verify = filter.verify;
				filter.verify = (...args) => !verify(...args);
			});
		}

		const deleted = await channel.purge(limit, activeFilters.length ?
			msg => activeFilters.every(filter => filter.verify(msg, filter.value)) :
			undefined);

		const msg = await reply(t("commands.purge", { deleted }));
		setTimeout(() => msg.delete(), 3000);
	},
	aliases: ["prune"],
	guildOnly: true,
	perm: "manageMessages",
	args: [{
		type: "int",
		min: 1,
		max: 2500,
		label: "limit"
	}],
	flags: [{
		name: "bots",
		short: "b",
		type: "boolean",
		default: false
	}, {
		name: "images",
		short: "im",
		type: "boolean",
		default: false
	}, {
		name: "files",
		short: "f",
		type: "boolean",
		default: false
	}, {
		name: "embeds",
		short: "e",
		type: "boolean",
		default: false
	}, {
		name: "links",
		short: "l",
		type: "boolean",
		default: false
	}, {
		name: "from",
		short: "f",
		aliases: ["user", "users", "u"],
		type: "user",
		array: true
	}, {
		name: "includes",
		short: "in",
		type: "text"
	}, {
		name: "matches",
		short: "m",
		type: "text"
	}, {
		name: "inverse",
		short: "inv",
		type: "boolean",
		default: false
	}]
};
