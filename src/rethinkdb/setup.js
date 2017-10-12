const config = require("../../config");
const { readdir } = require("fs");
const { promisify } = require("util");
const readdirAsync = promisify(readdir);
const path = require("path");

module.exports = async r => { // eslint-disable-line id-length
	if(process.env.NO_RETHINK) return Promise.resolve();

	const dbList = await r.dbList().run();
	if(!~dbList.indexOf(config.database.db)) await r.dbCreate(config.database.db).run();

	const tableList = await r.tableList().run();
	const tablesExpected = (await readdirAsync(path.resolve(__dirname, "tables")))
		.map(file => require(path.resolve(__dirname, "tables", file)));

	for(let table of tablesExpected) {
		if(!~tableList.indexOf(table.name)) await r.tableCreate(table.name, { primaryKey: table.primary }).run();

		const indexList = await r.table(table.name).indexList().run();
		for(let index of table.indexes.filter(ind => !~indexList.indexOf(ind))) {
			await r.table(table.name).indexCreate(index).run();
		}

		await r.table(table.name).indexWait().run();
	}

	await r.getPoolMaster().drain();
	return Promise.resolve();
};

