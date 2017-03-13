const actions = ["BAN", "UNBAN", "KICK", "MUTE", "UNMUTE"];
const autoReason = exports.reasons = {};

exports.getCases = async (guild) => {
	let data = await Oxyl.modScripts.sqlQueries.dbQuery(`SELECT * FROM ModLog WHERE GUILD = "${guild.id}"`);
	if(data && data.length >= 1) return data;
	else return false;
};

exports.modChannel = async (guild) => {
	let modlog = await Oxyl.modScripts.sqlQueries.settings.get(guild, "modlog");
	return guild.channels.get(modlog) || false;
};

exports.caseInfo = async (guild, casenum) => {
	let data = await Oxyl.modScripts.sqlQueries.dbQuery(`SELECT * FROM ModLog WHERE CASE_NUM = ${casenum} AND GUILD = "${guild.id}"`);
	if(data && data.length >= 1) return data[0];
	else return false;
};

exports.createCase = async (guild, action, user) => {
	let casenum = ((await exports.getCases(guild)).length || 0) + 1;

	let channel = await exports.modChannel(guild);
	if(!channel) return;

	let parsed = exports.parseCase(action, casenum, framework.unmention(user));
	let msg = await channel.createMessage(parsed);

	await Oxyl.modScripts.sqlQueries.dbQuery(`INSERT INTO ModLog(GUILD, ACTION, MSG, USER, USERID, CASE_NUM) ` +
		`VALUES ("${guild.id}", ${action}, "${msg.id}", ${Oxyl.modScripts.sqlQueries.sqlEscape(framework.unmention(user))}, "${user.id}", ${casenum})`);
	if(autoReason[guild.id]) {
		exports.setReason(guild, casenum, autoReason[guild.id].reason, autoReason[guild.id].mod);
		delete autoReason[guild.id];
	}
};

exports.parseCase = (action, casenum, user, reason, mod) => {
	action = actions[action];
	action = framework.capitalizeEveryFirst(action.toLowerCase());
	if(mod) mod = framework.unmention(mod);

	let parsed = `__**CASE #${casenum}**__` +
		`\n**ACTION**: ${action}` +
		`\n**USER**: ${user}`;

	if(reason) parsed += `\n**REASON**: ${reason}\n**MOD**: ${mod}`;
	else parsed += `\n**REASON**: Moderator, please run \`reason ${casenum}\``;

	return parsed;
};

exports.setReason = async (guild, casenum, reason, mod) => {
	let data = await exports.caseInfo(guild, casenum);
	if(!data) return "NO_CASE";

	let channel = await exports.modChannel(guild);
	if(!channel) return "NO_CHANNEL";

	try {
		var message = await channel.getMessage(data.MSG);
	} catch(err) {
		return "NO_MSG";
	}

	let parsed = exports.parseCase(data.ACTION, casenum, data.USER, reason, mod);
	await message.edit(parsed);
	await Oxyl.modScripts.sqlQueries.dbQuery(`UPDATE ModLog SET RESPONSIBLE = "${mod.id}", REASON = ${Oxyl.modScripts.sqlQueries.sqlEscape(reason)} ` +
		`WHERE CASE_NUM = ${casenum} AND guild = "${guild.id}"`);
	return "SUCCESS";
};

bot.on("guildBanAdd", (guild, user) => exports.createCase(guild, 0, user));
bot.on("guildBanRemove", (guild, user) => exports.createCase(guild, 1, user));

bot.on("guildMemberUpdate", (guild, member, oldMember) => {
	if(!member || !oldMember) return;
	else if(oldMember.roles === member.roles) return;
	let oldMute = oldMember.roles.find(role => guild.roles.has(role) && guild.roles.get(role).name.toLowerCase() === "muted");
	let newMute = member.roles.find(role => guild.roles.has(role) && guild.roles.get(role).name.toLowerCase() === "muted");

	if(oldMute && !newMute) exports.createCase(guild, 4, member.user);
	else if(!oldMute && newMute) exports.createCase(guild, 3, member.user);
});
