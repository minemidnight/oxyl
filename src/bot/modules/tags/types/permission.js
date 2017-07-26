module.exports = {
	name: "Permission",
	description: "A Discord Permission",
	examples: [`set {_perm} to perm to ban members`],
	run: async (options, perm) => ({
		type: "permission",
		value: perm
	})
};
