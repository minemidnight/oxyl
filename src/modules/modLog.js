const readableActions = {
	rolePersist: "Role Persistance",
	specialRoleAdd: "Special Role Added",
	specialRoleRemove: "Special Role Removed"
};

module.exports = {
	cases: guild => r.table("modLog").filter({ guildID: guild.id }).run(),
	channel: async guild => {
		let data = await r.table("settings").filter({ name: "modLog.channel", guildID: guild.id }).run();
		return data[0] ? data[0].value : undefined;
	},
	info: async (guild, caseNum) => (await r.table("modLog").filter({ guildID: guild.id, caseNum }).run())[0],
	create: async (guild, action, user, extraData = {}) => {
		let caseNum = ((await module.exports.cases(guild)).length || 0) + 1;
		let channelID = await module.exports.channel(guild);
		if(!channelID) return;

		let parseData = {
			action,
			caseNum,
			user: `${user.username}#${user.discriminator}`
		};

		let insertData = {
			action,
			caseNum,
			guildID: guild.id,
			userID: user.id,
			userDisplay: `${user.username}#${user.discriminator}`
		};

		for(let key in extraData) {
			parseData[key] = extraData[key];
			insertData[key] = extraData[key];
		}

		if(module.exports.presetReasons[guild.id]) {
			let preset = module.exports.presetReasons[guild.id];
			delete module.exports.presetReasons[guild.id];

			parseData.reason = preset.reason;
			parseData.mod = insertData.modDisplay = `${preset.mod.username}#${preset.mod.discriminator}`;

			insertData.reason = preset.reason;
			insertData.modID = preset.mod.id;
		}

		let parsed = module.exports.parse(guild, parseData);
		let message = await bot.createMessage(channelID, parsed);
		insertData.messageID = message.id;

		await r.table("modLog").insert(insertData).run();
	},
	set: async (guild, caseNum, reason, mod) => {
		let channelID = await module.exports.channel(guild);
		if(!channelID) return "NO_CHANNEL";

		let caseData = await module.exports.info(guild, caseNum);
		if(!caseData) return "NO_DATA";

		try {
			var message = await bot.getMessage(channelID, caseData.messageID);
		} catch(err) {
			return "NO_MSG";
		}

		let user = bot.users.has(caseData.userID) ?
			`${bot.users.get(caseData.userID).username}#${bot.users.get(caseData.userID).discriminator}` :
			caseData.userDisplay;
		let modDisplay = `${mod.username}#${mod.discriminator}`;

		let parsed = module.exports.parse(guild, {
			action: caseData.action,
			caseNum,
			mod: modDisplay,
			reason,
			role: caseData.role,
			user
		});

		await bot.editMessage(channelID, caseData.messageID, parsed);
		await r.table("modLog").get(caseData.id).update({
			userDisplay: user,
			modID: mod.id,
			modDisplay,
			reason
		}).run();
		return "SUCCESS";
	},
	parse: (guild, { action, caseNum, user, reason, mod, role }) => {
		if(readableActions[action]) action = readableActions[action];
		action = action.substring(0, 1).toUpperCase() + action.substring(1);

		let parsed = `__**CASE #${caseNum}**__\n` +
			`**ACTION**: ${action}`;
		if(role) parsed += ` (${guild.roles.get(role).name})`;

		parsed +=	`\n**USER**: ${user}\n` +
			`**REASON**: `;

		if(reason) parsed += `${reason}\n**MOD**: ${mod}`;
		else parsed += `Responsible moderator, set this using \`reason ${caseNum}\``;
		return parsed;
	},
	presetReasons: {}
};
