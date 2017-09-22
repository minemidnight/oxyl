const rethinkdbdash = require("rethinkdbdash");
module.exports = {
	init: async () => {
		const config = require(require("path").resolve("config.json"));
		if(!config.other.database) {
			console.warn("No RethinkDB connection info in config.json, Oxyl won't work as expected");
			return false;
		}

		let dbName = config.other.databaseName || "Oxyl";
		let connectionInfo = config.other.database;
		connectionInfo.silent = true;
		connectionInfo.db = dbName;
		const r = rethinkdbdash(connectionInfo); // eslint-disable-line id-length

		let dbs = await r.dbList().run();
		if(!~dbs.indexOf(dbName)) {
			console.info(`Creating database ${dbName}...`);
			await r.dbCreate(dbName).run();
		}

		let tableList = await r.tableList().run();
		let tablesExpected = [{
			name: "autoRole",
			primary: "roleID",
			indexes: ["guildID"]
		}, {
			name: "censors",
			primary: "id", // [censorID, guildID]
			indexes: ["guildID"]
		}, {
			name: "donators",
			primary: "userID"
		}, {
			name: "editedCommands",
			primary: "id", // [command, guildID]
			indexes: ["guildID"]
		}, {
			name: "ignoredChannels",
			primary: "channelID"
		}, {
			name: "locales",
			primary: "id"
		}, {
			name: "modLog",
			primary: "id", // [caseNum, guildID]
			indexes: ["guildID"]
		}, {
			name: "roleMe",
			primary: "roleID",
			indexes: ["guildID"]
		}, {
			name: "rolePersistRules",
			primary: "roleID",
			indexes: ["guildID"]
		}, {
			name: "rolePersistStorage",
			primary: "id" // [memberID, guildID]
		}, {
			name: "savedQueues",
			primary: "id" // [savedID, userID]
		}, {
			name: "settings",
			primary: "id", // [name, guildID]
			indexes: ["guildID"]
		}, {
			name: "tags",
			primary: "name",
			indexes: ["ownerID"]
		}, {
			name: "timedEvents",
			primary: "uuid",
			indexes: ["date"]
		}, {
			name: "warnings",
			primary: "uuid",
			indexes: ["userID"]
		}];

		for(let table of tablesExpected) {
			if(~tableList.indexOf(table.name)) continue;

			console.info(`Creating "${table.name}" table...`);
			await r.tableCreate(table.name, { primaryKey: table.primary }).run();

			if(table.indexes) {
				for(let index of table.indexes) await r.table(table.name).indexCreate(index).run();
			}
			if(table.insertions) {
				for(let insertion of table.insertions) await r.table(table.name).insert(insertion).run();
			}
		}

		console.startup(`RethinkDB initated on master`);
		await r.getPoolMaster().drain();
		return true;
	},
	connect: async () => {
		const config = require(require("path").resolve("config.json"));
		if(!config.other.database) return;

		let dbName = config.other.databaseName || "Oxyl";
		let connectionInfo = config.other.database;
		connectionInfo.silent = true;
		connectionInfo.db = dbName;
		global.r = rethinkdbdash(connectionInfo); // eslint-disable-line id-length

		if(typeof bot !== "undefined") module.exports.botStuff();
	},
	botStuff: async () => {
		let prefixes = await r.table("settings").filter({ name: "prefix" }).run();
		prefixes.forEach(setting => {
			let shard = ~~((setting.guildID / 4194304) % cluster.worker.totalShards);
			if(shard >= cluster.worker.shardStart && shard <= cluster.worker.shardEnd) {
				bot.prefixes.set(setting.guildID, setting.value);
			}
		});

		let censors = await r.table("censors").run();
		censors.forEach(censor => {
			let shard = ~~((censor.guildID / 4194304) % cluster.worker.totalShards);
			if(shard >= cluster.worker.shardStart && shard <= cluster.worker.shardEnd) {
				let censorsCache = bot.censors.get(censor.guildID);
				let censorObject = { action: censor.action, regex: censor.regex };
				if(censor.message) censorObject.message = censor.message;

				if(censorsCache) {
					censorsCache.set(censor.censorID, censorObject);
				} else {
					bot.censors.set(censor.guildID, new Map())
						.get(censor.guildID)
						.set(censor.censorID, censorObject);
				}
			}
		});

		let channels = await r.table("ignoredChannels").run();
		channels.forEach(ignored => {
			let shard = ~~((ignored.guildID / 4194304) % cluster.worker.totalShards);
			if(shard >= cluster.worker.shardStart && shard <= cluster.worker.shardEnd) {
				bot.ignoredChannels.set(ignored.channelID, ignored.guildID);
			}
		});

		let locales = await r.table("locales").run();
		locales.forEach(locale => bot.localeCache.set(locale.id, locale.locale));
	}
};

if(!cluster.isMaster) module.exports.connect();
