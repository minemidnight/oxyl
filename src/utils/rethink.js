global.r = require("rethinkdb"); // eslint-disable-line id-length
module.exports = {
	init: async () => {
		let connection = await r.connect(bot.privateConfig.database);

		let dbs = r.dbList.run();
		if(!~dbs.indexOf("Oxyl")) {
			console.log("Creating database Oxyl...");
			await r.dbCreate("Oxyl").run();
		}
		connection.use("Oxyl");

		let tableList = await r.tableList().run();
		let tablesExpected = [
			"autoRole", "blacklist", "editedCommands",
			"ignoredChannels", "modLog", "musicCache",
			"roleMe", "settings", "timedEvents"
		];

		for(let table of tablesExpected) {
			if(!~tableList.indexOf(table)) {
				console.log(`Creating "${table}" table...`);
				await r.tableCreate(table).run();
			}
		}

		let prefixes = await r.table("settings").filter({ name: "prefix" }).run();
		prefixes.forEach(setting => bot.prefixes.set(setting.guildID, setting.value));
	}
};

module.exports.init();
