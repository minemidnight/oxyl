module.exports = {
	name: "Less Than",
	description: "Check if one thing is less than another",
	examples: [`if 0 is more than 1:\n\treturn "That's not possible!"\nend`],
	patterns: [`%objects% ((is|are) ((less|smaller) than|below)|<) %objects%`],
	rrun: async (options, any1, any2) => any1 < any2
};
