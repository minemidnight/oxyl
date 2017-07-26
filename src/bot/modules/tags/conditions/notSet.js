module.exports = {
	name: "Not Set",
	description: "Check if something is not set",
	examples: [`if {_user} is not set:\n\tset {_user} to author of event-message`],
	patterns: [`%anys% (do[es](n't| not) exist|(is|are)(n't| not) set)`],
	run: async (options, type) => type === undefined || type === null
};
