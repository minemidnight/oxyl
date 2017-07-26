module.exports = {
	name: "Equals",
	description: "Check if two things are equal",
	examples: [`if 0 is 1:\nreturn "That's not possible!"`],
	patterns: [`%anys% (is|are) %anys%`, `%any% (equal[s]|(is|are) equal[s] to) %any%`, `%any% =[=][=] %any%`],
	run: async (options, any1, any2) => any1 === any2
};
