module.exports = {
	name: "Join",
	description: "Joins serveral texts with a common delimiter (e.g. ',')",
	examples: [`set {_roles} to names of roles of member from event-message joined by ", "`],
	patterns: [`join %texts% [(with|using|by) [[the] delimiter] %text%]`,
		`%texts% joined [(with|using|by) [[the] delimiter] %text%]`],
	giveFullLists: true,
	run: async (options, texts, joiner) => {
		if(!joiner) return `${texts.slice(0, -1).join(", ")}, and ${texts.slice(-1)}`;
		else return texts.join(joiner);
	}
};
