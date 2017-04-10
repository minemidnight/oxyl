const rethinkdbdash = require("rethinkdbdash");
module.exports = {
	init: async () => {
		if(!bot.privateConfig.database) {
			console.warn("No RethinkDB connection info in private-config.yml, Oxyl won't work as expected");
			return;
		}
		let dbName = bot.publicConfig.databaseName || "Oxyl";
		let connectionInfo = bot.privateConfig.database;
		connectionInfo.silent = true;
		connectionInfo.db = dbName;
		global.r = rethinkdbdash(connectionInfo); // eslint-disable-line id-length

		let dbs = await r.dbList().run();
		if(!~dbs.indexOf(dbName)) {
			console.info(`Creating database ${dbName}...`);
			await r.dbCreate(dbName).run();
		}

		let tableList = await r.tableList().run();
		let tablesExpected = [
			"autoRole", "blacklist", "editedCommands",
			"ignoredChannels", "modLog", "musicCache", "roleMe",
			"rolePersist", "settings", "timedEvents", "warnings"
		];

		for(let table of tablesExpected) {
			if(!~tableList.indexOf(table)) {
				console.info(`Creating "${table}" table...`);
				await r.tableCreate(table).run();
			}
		}
		console.startup(`RethinkDB successfully started on worker ${cluster.worker.id}`);

		let prefixes = await r.table("settings").filter({ name: "prefix" }).run();
		console.info(`Grabbed ${prefixes.length} prefixes to store in cache (worker ${cluster.worker.id})`);
		prefixes.forEach(setting => bot.prefixes.set(setting.guildID, setting.value));

		let channels = await r.table("ignoredChannels").run();
		console.info(`Grabbed ${prefixes.length} ignored channels to store in cache (worker ${cluster.worker.id})`);
		channels.forEach(ignored => bot.ignoredChannels.set(ignored.channelID, ignored.guildID));
	}
};

module.exports.init();
