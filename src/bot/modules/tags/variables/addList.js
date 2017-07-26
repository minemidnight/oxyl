module.exports = {
	name: "Add to List",
	description: "Add to a list",
	examples: [`add "test" to {_list::*}`],
	patterns: [`add %anys% to %list%`],
	giveFullLists: true,
	run: (options, any, list) => {
		list.push(any);
		return list;
	}
};
