const { readdir } = require("fs");
const { promisfy } = require("util");
const readdirAsync = promisfy(readdir);

module.exports = async r => { // eslint-disable-line id-length
	const tableList = await r.tableList().run();
	const tableExpected = (await readdirAsync("./tables")).map(file => require(`./tables/${file}`));

	for(let table of tableExpected) {
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

