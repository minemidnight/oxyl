const rethinkdbdash = require("rethinkdbdash");
module.exports = {
	init: async () => {
		const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
		const privateConfig = JSON.parse(require("fs").readFileSync("private-config.json").toString());
		if(!privateConfig.database) {
			console.warn("No RethinkDB connection info in private-config.yml, Oxyl won't work as expected");
			return false;
		}

		let dbName = publicConfig.databaseName || "Oxyl";
		let connectionInfo = privateConfig.database;
		connectionInfo.silent = true;
		connectionInfo.db = dbName;
		const r = rethinkdbdash(connectionInfo); // eslint-disable-line id-length

		let dbs = await r.dbList().run();
		if(!~dbs.indexOf(dbName)) {
			console.info(`Creating database ${dbName}...`);
			await r.dbCreate(dbName).run();
		}

		let tableList = await r.tableList().run(), tableWait = [];
		let tablesExpected = [
			"autoRole", "blacklist", "censors", "donators", "editedCommands",
			"ignoredChannels", "locales", "modLog", "roleMe",
			"rolePersist", "savedQueues", "settings", "timedEvents", "warnings"
		];

		for(let table of tablesExpected) {
			if(!~tableList.indexOf(table)) {
				console.info(`Creating "${table}" table...`);
				await r.tableCreate(table).run();
			}
		}
		await Promise.all(tableWait);
		console.startup(`RethinkDB initated on master`);
		console.log(r);
		await r.close();
		return true;
	},
	connect: async () => {
		if(!bot.privateConfig.database) return;

		let dbName = bot.publicConfig.databaseName || "Oxyl";
		let connectionInfo = bot.privateConfig.database;
		connectionInfo.silent = true;
		connectionInfo.db = dbName;
		global.r = rethinkdbdash(connectionInfo); // eslint-disable-line id-length

		let prefixes = await r.table("settings").filter({ name: "prefix" }).run();
		prefixes.forEach(setting => {
			let shard = ~~((setting.guildID / 4194304) % cluster.worker.maxShards);
			if(shard >= cluster.worker.shardStart && shard <= cluster.worker.shardEnd) {
				bot.prefixes.set(setting.guildID, setting.value);
			}
		});

		let censors = await r.table("censors").run();
		censors.forEach(censor => {
			let shard = ~~((censor.guildID / 4194304) % cluster.worker.maxShards);
			if(shard >= cluster.worker.shardStart && shard <= cluster.worker.shardEnd) {
				let censorsCache = bot.censors.get(censor.guildID);
				if(censorsCache) {
					censorsCache.set(censor.censorID, { action: censor.action, regex: censor.regex });
				} else {
					bot.censors.set(censor.guildID, new Map())
						.get(censor.guildID)
						.set(censor.censorID, { action: censor.action, regex: censor.regex });
				}
			}
		});

		let channels = await r.table("ignoredChannels").run();
		channels.forEach(ignored => {
			let shard = ~~((ignored.guildID / 4194304) % cluster.worker.maxShards);
			if(shard >= cluster.worker.shardStart && shard <= cluster.worker.shardEnd) {
				bot.ignoredChannels.set(ignored.channelID, ignored.guildID);
			}
		});

		let locales = await r.table("locales").run();
		locales.forEach(locale => bot.localeCache.set(locale.id, locale.locale));
	}
};

if(!cluster.isMaster) module.exports.connect();
