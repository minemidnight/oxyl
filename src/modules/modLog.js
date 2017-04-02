const readableActions = {
	rolePersist: "Role Persistance",
	specialRoleAdd: "Special Role Added",
	specialRoleRemove: "Special Role Removed"
};
module.exports = {
	cases: guild => r.table("modLog").filter({ guildId: guild.id }).run(),
	channel: async guild => {
		let data = await r.table("settings").filter({ name: "modLog", guildId: guild.id }).run();
		return data[0] ? data[0].value : undefined;
	},
	info: async (guild, caseNum) => (await r.table("modLog").filter({ guildId: guild.id, caseNum }).run())[0],
	create: async (guild, action, user) => {
		let caseNum = ((await module.exports.cases(guild)).length || 0) + 1;
		let channelId = await module.exports.channel(guild);
		if(!channelId) return;

		let parseData = {
			action,
			caseNum,
			user: `${user.username}#${user.discriminator}`
		};

		let insertData = {
			action,
			caseNum,
			guildId: guild.id,
			userId: user.id,
			userDisplay: `${user.username}#${user.discriminator}`
		};

		if(module.exports.presetReasons[guild.id]) {
			let preset = module.exports.presetReasons[guild.id];
			delete module.exports.presetReasons[guild.id];

			parseData.reason = preset.reason;
			parseData.mod = preset.mod;

			insertData.reason = preset.reason;
			insertData.modId = preset.mod.id;
			insertData.modDisplay = `${preset.mod.username}#${preset.mod.discriminator}`;
		}

		let parsed = module.exports.parse(parseData);
		let message = await bot.createMessage(channelId, parsed);
		insertData.messageId = message.id;

		await r.table("modLog").insert(insertData).run();
	},
	set: async (guild, caseNum, reason, mod) => {
		let channelId = await module.exports.channel(guild);
		if(!channelId) return "NO_CHANNEL";

		let caseData = await module.exports.info(guild, caseNum);
		if(!caseData) return "NO_DATA";

		try {
			var message = await bot.getMessage(channelId, caseData.messageId);
		} catch(err) {
			return "NO_MSG";
		}

		let user = bot.users.has(caseData.userId) ?
			`${bot.users.get(caseData.userId).username}#${bot.users.get(caseData.userId).discriminator}` :
			caseData.userDisplay;
		let modDisplay = `${mod.username}#${mod.discriminator}`;

		let parsed = module.exports.parse({
			action: caseData.action,
			caseNum,
			user,
			reason,
			mod: modDisplay
		});

		await bot.editMessage(channelId, caseData.messageId, parsed);
		await r.table("modLog").get(caseData.id).update({
			userDisplay: user,
			modId: mod.id,
			modDisplay,
			reason
		}).run();
		return "SUCCESS";
	},
	parse: ({ action, caseNum, user, reason, mod }) => {
		if(readableActions[action]) action = readableActions[action];
		action = action.substring(0, 1).toUpperCase() + action.substring(1);

		let parsed = `__**CASE #${caseNum}**__\n` +
			`**ACTION**: ${action}\n` +
			`**USER**: ${user}\n` +
			`**REASON**: `;

		if(reason) parsed += `${reason}\n**MOD**: ${mod}`;
		else parsed += `Responsible moderator, set this using \`reason ${caseNum}\``;
		return parsed;
	},
	presetReasons: {}
};
