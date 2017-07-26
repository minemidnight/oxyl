module.exports = {
	name: "Greater Than",
	description: "Check if one thing is greater than another",
	examples: [`if 0 is less than 2:\n\treturn "0 is less than 2"`],
	patterns: [`%anys% ((greater|more|higher|bigger|larger) than|above)|>) %anys%`],
	run: async (options, any1, any2) => any1 > any2
};
