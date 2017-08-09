module.exports = {
	name: "Amount",
	description: "The amount of something in a list",
	examples: [`set {_amount} to amount of {_member}'s roles`],
	patterns: [`[the] (amount|number|size)[s] of %lists%`],
	returns: "integer",
	run: async (options, list) => list.length
};
