module.exports = {
	name: "Text",
	description: "A string",
	examples: [`set {_text} to true`],
	patterns: [`true`, `false`],
	run: async (options) => {
		if(options.matchIndex === 0) return { type: "boolean", value: true };
		else return { type: "boolean", value: false };
	}
};
