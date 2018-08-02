const config = require("../../config");
const { readdir } = require("fs");
const { promisify } = require("util");
const readdirAsync = promisify(readdir);
const path = require("path");

module.exports = async r => {
	const dbList = await r.dbList().run();
	if(!dbList.includes(config.database.db)) await r.dbCreate(config.database.db).run();

	const tableList = await r.tableList().run();
	const tablesExpected = (await readdirAsync(path.resolve(__dirname, "tables")))
		.map(file => require(path.resolve(__dirname, "tables", file)));

	for(const table of tablesExpected) {
		if(!tableList.includes(table.name)) await r.tableCreate(table.name, { primaryKey: table.primary }).run();

		const indexList = await r.table(table.name).indexList().run();
		for(const index of (table.indexes || []).filter(ind => !indexList.includes(Array.isArray(ind) ? ind[0] : ind))) {
			if(Array.isArray(index)) {
				await r.table(table.name).indexCreate(index[0], index[1].map(row => r.row(row)));
			} else {
				await r.table(table.name).indexCreate(index).run();
			}
		}

		await r.table(table.name).indexWait().run();
	}

	return r;
};

