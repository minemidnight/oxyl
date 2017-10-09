const { readdir } = require("fs");
const { promisify } = require("util");
const readdirAsync = promisify(readdir);
const path = require("path");

module.exports = async r => { // eslint-disable-line id-length
	const tableList = await r.tableList().run();
	const tablesExpected = (await readdirAsync(path.resolve(__dirname, "tables")))
		.map(file => require(path.resolve(__dirname, "tables", file)));

	for(let table of tablesExpected) {
		if(!~tableList.indexOf(table)) await r.tableCreate(table.name, { primary: table.primary }).run();

		const indexList = await r.table(table.name).indexList().run();
		for(let index of table.indexes.filter(ind => !~indexList.indexOf(ind))) {
			await r.table(table.name).indexCreate(index).run();
		}

		await r.table(table.name).indexWait().run();
	}

	await r.getPoolMaster().drain();
	return Promise.resolve();
};

