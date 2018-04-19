const modLog = require("./modLog");

const getWarns = async (member, r) => r.table("warnings")
	.getAll([member.guild.id, member.id], { index: "guildAndUserID" })
	.run();

const getPardons = async (member, r) => r.table("pardons")
	.getAll([member.guild.id, member.id], { index: "guildAndUserID" })
	.run();

const pardon = async (member, reason, warnID, pardoner, wiggle) => {
	const r = wiggle.locals.r;
	const { changes: [{ old_val: warn }] } = await r.table("warnings")
		.get(warnID)
		.delete({ returnChanges: true })
		.run();

	await r.table("pardons")
		.insert({
			id: warn.id,
			guildAndUserID: warn.guildAndUserID,
			reason,
			pardonerID: pardoner.id,
			warning: {
				reason: warn.reason,
				warnerID: warn.warnerID
			}
		});

	modLog.pardon({
		punished: member.user,
		guild: member.guild,
		responsible: pardoner,
		reason
	}, wiggle);
};

const warn = async (member, reason, warner, wiggle) => {
	const r = wiggle.locals.r;
	const id = (Date.now() + process.hrtime().reduce((a, b) => a + b)).toString(36);

	await r.table("warnings")
		.insert({
			id,
			reason,
			guildAndUserID: [member.guild.id, member.id],
			warnerID: warner.id
		})
		.run();

	const warnCount = await r.table("warnings")
		.getAll([member.guild.id, member.id], { index: "guildAndUserID" })
		.count()
		.run();

	const threshold = await r.table("warningThresholds")
		.get([member.guild.id, warnCount])
		.run();

	await modLog.warn({
		punished: member.user,
		guild: member.guild,
		responsible: warner,
		reason
	}, wiggle);

	if(!threshold) {
		return warnCount;
	} else if(threshold.action === "role") {
		modLog.addRole({
			punished: member.user,
			guild: member.guild,
			responsible: wiggle.erisClient.user,
			reason: `Warning Threshold for ${warnCount} warns`,
			time: threshold.time && threshold.time * 1000,
			role: { id: threshold.roleID }
		}, wiggle);

		await member.addRole(threshold.roleID, `Warning Threshold for ${warnCount} warns`)
			.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
	} else if(threshold.action === "kick") {
		await member.kick(`Warning Threshold for ${warnCount} warns`)
			.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
	} else if(threshold.action === "softban") {
		await member.ban(7, `Warning Threshold for ${warnCount} warns`)
			.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function

		await member.unban(`Warning Threshold for ${warnCount} warns`)
			.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
	} else if(threshold.action === "ban") {
		modLog.ban({
			punished: member.user,
			guild: member.guild,
			responsible: wiggle.erisClient.user,
			reason: `Warning Threshold for ${warnCount} warns`,
			time: threshold.time && threshold.time * 1000
		}, wiggle);

		await member.ban(7, `Warning Threshold for ${warnCount} warns`)
			.catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function
	}

	return warnCount;
};

module.exports = { getPardons, getWarns, pardon, warn };
