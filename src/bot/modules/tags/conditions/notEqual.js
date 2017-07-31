module.exports = {
	name: "Not Equal",
	description: "Check if two things are not equal",
	examples: [`if 0 is not 0:\n\treturn "That's not possible!"\nend`],
	patterns: [`%any% is not %any%`,
		`%any% ((doesn[']t|does not) equal|(isn[']t|is not) equal to) %any%`,
		`%any% !=[=] %any%`],
	run: async (options, any1, any2) => any1 !== any2
};
