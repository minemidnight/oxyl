module.exports = {
	name: "Equals",
	description: "Check if something is set",
	examples: [`if {_nick} is set:\n\tset {_length} to length of {_nick}\nend`],
	patterns: [`%anys% (exist[s]|(is|are) set)`],
	run: async (options, type) => type !== undefined && type !== null
};
