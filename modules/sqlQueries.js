const mysql = require("promise-mysql");
let dbQuery, sqlEscape;

module.exports = {
	init: async () => {
		let dbData = framework.config.database;
		dbData.password = framework.config.private.databasePass;
		sqlEscape = module.exports.sqlEscape = mysql.escape;
		let connection = await mysql.createConnection(dbData);
		dbQuery = module.exports.dbQuery = (query) => connection.query(query);

		dbQuery(`CREATE TABLE IF NOT EXISTS AutoRole (` +
			`ID text COLLATE utf8mb4_bin NOT NULL,` +
			`ROLE text COLLATE utf8mb4_bin NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS Blacklist (` +
			`USER text COLLATE utf8mb4_bin NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS ChannelTags (` +
			`CREATOR mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`ID mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`NAME mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CREATED_AT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CONTENT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`USES int(11) NOT NULL,` +
			`TAG_NUM int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (TAG_NUM)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS CustomCommands (` +
			`GUILD text COLLATE utf8mb4_bin NOT NULL,` +
			`COMMAND text COLLATE utf8mb4_bin NOT NULL,` +
			`TAG text COLLATE utf8mb4_bin NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS Description (` +
			`USER text COLLATE utf8mb4_bin NOT NULL,` +
			`VALUE text COLLATE utf8mb4_bin NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS EditedCommands (` +
			`GUILD_ID text COLLATE utf8mb4_bin NOT NULL,` +
			`COMMAND text COLLATE utf8mb4_bin NOT NULL,` +
			`ROLES text COLLATE utf8mb4_bin NOT NULL,` +
			`ENABLED tinyint(1) NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS EditedCommands (` +
			`GUILD_ID text COLLATE utf8mb4_bin NOT NULL,` +
			`COMMAND text COLLATE utf8mb4_bin NOT NULL,` +
			`ROLES text COLLATE utf8mb4_bin NOT NULL,` +
			`ENABLED tinyint(1) NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS GlobalTags (` +
			`CREATOR mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`NAME mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CREATED_AT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CONTENT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`USES int(11) NOT NULL,` +
			`TAG_NUM int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (TAG_NUM)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS GuildTags (` +
			`CREATOR mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`ID mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`NAME mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CREATED_AT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CONTENT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`USES int(11) NOT NULL,` +
			`TAG_NUM int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (TAG_NUM)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS Ignored (` +
			`GUILD text COLLATE utf8mb4_bin NOT NULL,` +
			`CHANNEL text COLLATE utf8mb4_bin NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS ModLog (` +
			`GUILD text COLLATE utf8mb4_bin NOT NULL,` +
			`ACTION int(11) NOT NULL,` +
			`MSG text COLLATE utf8mb4_bin NOT NULL,` +
			`USER text COLLATE utf8mb4_bin NOT NULL,` +
			`USERID text COLLATE utf8mb4_bin NOT NULL,` +
			`RESPONSIBLE text COLLATE utf8mb4_bin NOT NULL,` +
			`REASON text COLLATE utf8mb4_bin NOT NULL,` +
			`CASE_NUM int(11) NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS Reminders (` +
			`USER text COLLATE utf8mb4_bin NOT NULL,` +
			`MESSAGE text COLLATE utf8mb4_bin NOT NULL,` +
			`DATE bigint(11) NOT NULL,` +
			`CREATED bigint(11) NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS RoleMe (` +
			`ID text COLLATE utf8mb4_bin NOT NULL,` +
			`ROLE text COLLATE utf8mb4_bin NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS Settings (` +
			`NAME mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`VALUE mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`ID mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS TagVars (` +
			`NAME text COLLATE utf8mb4_bin NOT NULL,` +
			`AUTHOR text COLLATE utf8mb4_bin NOT NULL,` +
			`VALUE text COLLATE utf8mb4_bin NOT NULL,` +
			`NO_DUPLICATE int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (NO_DUPLICATE)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS UnlistedTags (` +
			`CREATOR mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`NAME mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CREATED_AT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CONTENT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`USES int(11) NOT NULL,` +
			`TAG_NUM int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (TAG_NUM)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0 ;`);

		dbQuery(`CREATE TABLE IF NOT EXISTS UserTags (` +
			`CREATOR mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`NAME mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CREATED_AT mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`CONTENT text COLLATE utf8mb4_unicode_ci NOT NULL,` +
			`USES int(11) NOT NULL,` +
			`TAG_NUM int(11) NOT NULL AUTO_INCREMENT,` +
			`PRIMARY KEY (TAG_NUM)` +
		`) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=0 ;`);
	},

	editCommands: {
		reset: async (cmd, guild) => dbQuery(`DELETE FROM EditedCommands WHERE GUILD_ID = "${guild.id}" AND COMMAND = "${cmd}"`),
		info: async (cmd, guild) => {
			let data = await dbQuery(`SELECT * FROM EditedCommands WHERE GUILD_ID = "${guild.id}" AND COMMAND = "${cmd}"`);
			if(data.length === 0) return false;
			if(data[0].ROLES) data[0].ROLES = data[0].ROLES.split(",");
			return data[0];
		},
		edit: async (cmd, options, guild) => {
			let info = await module.exports.editCommands.info(cmd, guild);
			if(options === "toggle") {
				let toggle = 0;
				if(info && info.ENABLED === 0) toggle = 1;
				if(!info) await dbQuery(`INSERT INTO EditedCommands(GUILD_ID, COMMAND, ENABLED) VALUES ("${guild.id}","${cmd}",${toggle})`);
				else await dbQuery(`UPDATE EditedCommands SET ENABLED=${toggle} WHERE GUILD_ID = "${guild.id}" AND COMMAND = "${cmd}"`);
				return toggle;
			} else if(Array.isArray(options)) {
				if(!info) return await dbQuery(`INSERT INTO EditedCommands(GUILD_ID, COMMAND, ROLES, ENABLED) VALUES("${guild.id}","${cmd}","${options.join(",")}",1)`);
				else return await dbQuery(`UPDATE EditedCommands SET ROLES="${options.join(",")}" WHERE GUILD_ID = "${guild.id}" AND COMMAND = "${cmd}"`);
			} else {
				return false;
			}
		}
	},

	settings: {
		get: async (guild, setting) => {
			let data = await dbQuery(`SELECT VALUE FROM Settings WHERE ID = "${guild.id}" AND NAME = ${sqlEscape(setting)}`);
			if(data.length === 0) return false;
			else return data[0].VALUE;
		},
		set: async (guild, setting, value) => {
			let isSet = await module.exports.settings.get(guild, setting);

			if(isSet) dbQuery(`UPDATE Settings SET VALUE = ${sqlEscape(value)} WHERE ID = "${guild.id}" AND NAME = ${sqlEscape(setting)}`);
			else dbQuery(`INSERT INTO Settings(NAME, VALUE, ID) VALUES (${sqlEscape(setting)},${sqlEscape(value)},"${guild.id}")`);
			if(setting === "prefix") Oxyl.modScripts.commandHandler.prefixes[guild.id] = value;
		},
		reset: async (guild, setting) => {
			dbQuery(`DELETE FROM Settings WHERE ID = "${guild.id}" AND NAME = ${sqlEscape(setting)}`);
			if(setting === "prefix") delete Oxyl.modScripts.commandHandler.prefixes[guild.id];
		}
	},

	customCommands: {
		get: async (guildid, command) => {
			let data = await dbQuery(`SELECT TAG FROM CustomCommands WHERE GUILD = "${guildid}" AND COMMAND = ${sqlEscape(command)}`);
			if(data.length === 0) return false;
			else return data[0].TAG;
		},
		create: async (guildid, command, tag) => {
			dbQuery(`INSERT INTO CustomCommands(GUILD, COMMAND, TAG) VALUES ("${guildid}",${sqlEscape(command)},${sqlEscape(tag)})`);
		},
		delete: async (guildid, command) => {
			dbQuery(`DELETE FROM CustomCommands WHERE GUILD = "${guildid}" AND COMMAND = ${sqlEscape(command)}`);
		}
	},

	roleSetters: {
		get: async (guild, type, role) => {
			let tableName = type === "auto" ? "AutoRole" : "RoleMe";
			if(role) {
				let data = await dbQuery(`SELECT ROLE FROM ${tableName} WHERE ID = "${guild.id}" AND ROLE = "${role.id}"`);
				return data.length;
			} else {
				return await dbQuery(`SELECT * FROM ${tableName} WHERE ID = "${guild.id}"`);
			}
		},
		add: async (guild, type, role) => {
			let tableName = type === "auto" ? "AutoRole" : "RoleMe";
			dbQuery(`INSERT INTO ${tableName} (ID, ROLE) VALUES ("${guild.id}","${role.id}")`);
		},
		delete: async (guild, type, role) => {
			let tableName = type === "auto" ? "AutoRole" : "RoleMe";
			dbQuery(`DELETE FROM ${tableName} WHERE ID = "${guild.id}" AND ROLE = "${role.id}"`);
		}
	},

	clearGuildData: async (guild) => {
		let tables = {
			AutoRole: "ID",
			CustomCommands: "GUILD",
			EditedCommands: "GUILD_ID",
			GuildTags: "ID",
			Ignored: "GUILD",
			RoleMe: "ID",
			Settings: "ID",
			ModLog: "GUILD"
		};

		for(let key in tables) dbQuery(`DELETE FROM ${key} WHERE ${tables[key]} = "${guild.id}"`);
	}
};
module.exports.init();
