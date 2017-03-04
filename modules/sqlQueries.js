const mysql = require("promise-mysql");
let dbQuery, sqlEscape;

module.exports = {
	init: async () => {
		let dbData = framework.config.database;
		dbData.password = framework.config.private.databasePass;
		sqlEscape = sqlEscape = mysql.escape;
		let connection = await mysql.createConnection(dbData);
		dbQuery = module.exports.dbQuery = (query) => connection.query(query);
	},

	editCommands: {
		reset: async (cmd, guild) => dbQuery(`DELETE FROM EditedCommands WHERE GUILD_ID = "${guild.id}" AND COMMAND = "${cmd}"`),
		info: async (cmd, guild) => {
			let data = await dbQuery(`SELECT * FROM EditedCommands WHERE GUILD_ID = "${guild.id}" AND COMMAND = "${cmd}"`);
			if(data.length === 0) return false;
			else return data[0];
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
				if(!info) return await dbQuery(`INSERT INTO EditedCommands(GUILD_ID, COMMAND, ROLES) VALUES ("${guild.id}","${cmd}","${options.join(",")}")`);
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

			if(isSet) dbQuery(`UPDATE Settings SET VALUE = ${sqlEscape(value)} WHERE ID = ""${guild.id}" AND NAME = ${sqlEscape(setting)}`);
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
				return data.length === 0;
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
