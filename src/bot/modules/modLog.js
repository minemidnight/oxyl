const recentActions = new Map();

const createTimedEvent = async (data, r) => r.table("timedEvents").insert(data).run();
const createEntry = async (data, wiggle) => {
	const { action, guild, punished, responsible, reason, role, time } = data;
	const caseID = await wiggle.locals.r.table("modLog").getAll(guild.id, { index: "guildID" }).count().add(1);
	data.caseID = caseID;

	const entry = {
		action,
		caseID,
		guildID: guild.id,
		id: [caseID, guild.id],
		modID: responsible ? responsible.id : undefined,
		userID: punished.id,
		roleID: role ? role.id : undefined,
		reason,
		time
	};

	entry.messageID = await entryMessage(data, wiggle);
	await wiggle.locals.r.table("modLog").insert(entry).run();
	return entry.caseID;
};

const updateEntry = async (caseID, data, wiggle) => {
	const messageID = await wiggle.locals.r.table("modLog")
		.get([caseID, data.guild.id])
		.getField("messageID")
		.default(null)
		.run();
	if(!messageID) return;

	const channelID = await getChannel(data.guild.id, wiggle.locals.r);
	if(!channelID) return;

	await wiggle.erisClient.editMessage(channelID, messageID, buildMessage(data));
};

const getChannel = async (guildID, r) => {
	const { enabled, channelID } = await r.table("modLogSettings").get(guildID).pluck("enabled", "channelID").run();

	return enabled && channelID ? channelID : undefined;
};

const buildMessage = ({ action, caseID, guild, punished, responsible, reason, role, time, warnCount }) => {
	let message = `__**CASE #${caseID}**__\n`;
	message += `**ACTION**: ${action.charAt(0).toUpperCase() + action.substring(1)}\n`;
	message += `**USER**: ${punished.username}#${punished.discriminator} (${punished.id})\n`;

	if(warnCount) message += `**TOTAL WARNINGS**: ${warnCount}\n`;
	if(role) message += `**ROLE**: ${role.name ? role.name : guild.roles.has(role.id).name} (${role.id})\n`;
	if(time) {
		const timespanString = Object.entries({
			months: Math.floor(time / 2592000000),
			weeks: Math.floor(time % 2592000000 / 604800000),
			days: Math.floor(time % 2592000000 % 604800000 / 86400000),
			hours: Math.floor(time % 2592000000 % 604800000 % 86400000 / 3600000),
			minutes: Math.floor(time % 2592000000 % 604800000 % 86400000 % 3600000 / 60000),
			seconds: Math.floor(time % 2592000000 % 604800000 % 86400000 % 3600000 % 60000 / 1000)
		}).reduce((a, [key, value]) => {
			if(!value) return a;
			else return `${a}${value}${key === "months" ? "M" : key.charAt(0)}`;
		}, "");

		message += `**DURATION**: ${timespanString}\n`;
	}

	if(reason) {
		message += `**REASON**: ${reason}\n`;
		message += `**MOD**: ${responsible.username}#${responsible.discriminator} (${responsible.id})\n`;
	} else {
		message += `**REASON**: Responsible moderator, please set this using \`reason ${caseID}\`\n`;
	}

	return message;
};

const entryMessage = async (data, wiggle) => {
	const channelID = await getChannel(data.guild.id, wiggle.locals.r);
	if(!channelID) return undefined;

	return wiggle.erisClient.createMessage(channelID, buildMessage(data))
		.then(message => message.id)
		.catch(err => undefined); // eslint-disable-line handle-callback-err
};

const ban = async ({ punished, guild, responsible, reason, time }, wiggle) => {
	if(recentActions.has(`bans-${guild.id}-${punished.id}`)) return;

	if(time) {
		await createTimedEvent({
			date: Date.now() + time,
			type: "tempban",
			userID: punished.id,
			guildID: guild.id
		}, wiggle.locals.r);
	}

	const caseID = await createEntry({
		action: time ? "tempban" : "ban",
		guild,
		punished,
		responsible,
		reason,
		time
	}, wiggle);

	recentActions.set(`bans-${guild.id}-${punished.id}`, caseID);
	setTimeout(() => recentActions.delete(`bans-${guild.id}-${punished.id}`), 30000);
};

const kick = async ({ punished, guild, responsible, reason }, wiggle) => {
	await createEntry({
		action: "kick",
		guild,
		punished,
		responsible,
		reason
	}, wiggle);
};

const unban = async ({ punished, guild, responsible, reason }, wiggle) => {
	if(recentActions.has(`bans-${guild.id}-${punished.id}`)) {
		updateEntry(recentActions.get(`bans-${guild.id}-${punished.id}`), {
			action: "softban",
			guild,
			punished,
			responsible,
			reason
		}, wiggle);

		recentActions.delete(`bans-${guild.id}-${punished.id}`);
	} else {
		await createEntry({
			action: "unban",
			guild,
			punished,
			responsible,
			reason
		}, wiggle);
	}
};

const addRole = async ({ punished, guild, responsible, reason, time, role }, wiggle) => {
	if(recentActions.has(`addRole-${guild.id}-${punished.id}`)) return;

	if(time) {
		await createTimedEvent({
			date: Date.now() + time,
			type: "temprole",
			userID: punished.id,
			guildID: guild.id,
			roleID: role.id
		}, wiggle.locals.r);
	}

	const caseID = await createEntry({
		action: time ? "temprole" : "add role",
		guild,
		punished,
		responsible,
		reason,
		time,
		role
	}, wiggle);

	recentActions.set(`addRole-${guild.id}-${punished.id}`, caseID);
	setTimeout(() => recentActions.delete(`addRole-${guild.id}-${punished.id}`), 10000);
};

const removeRole = async ({ punished, guild, responsible, reason, role }, wiggle) => {
	if(recentActions.has(`removeRole-${guild.id}-${punished.id}`)) return;

	const caseID = await createEntry({
		action: "remove role",
		guild,
		punished,
		responsible,
		reason,
		role
	}, wiggle);

	recentActions.set(`removeRole-${guild.id}-${punished.id}`, caseID);
	setTimeout(() => recentActions.delete(`removeRole-${guild.id}-${punished.id}`), 10000);
};

const warn = async ({ punished, guild, responsible, reason }, wiggle) => await createEntry({
	action: "warn",
	guild,
	punished,
	responsible,
	reason,
	warnCount: await wiggle.locals.r
		.table("warnings")
		.getAll([guild.id, punished.id], { index: "guildAndUserID" })
		.count()
		.run()
}, wiggle);

const pardon = async ({ punished, guild, responsible, reason }, wiggle) => await createEntry({
	action: "pardon",
	guild,
	punished,
	responsible,
	reason,
	warnCount: await wiggle.locals.r
		.table("warnings")
		.getAll([guild.id, punished.id], { index: "guildAndUserID" })
		.count()
		.run()
}, wiggle);

module.exports = { addRole, removeRole, ban, kick, unban, warn, pardon };
