module.exports = {
	name: "Mention of user/member/channel/role",
	description: "Mention of a user/member/channel/role",
	examples: [`return "Hi, %mention of author of event-message%"`],
	patterns: [`[the] mention[s] of %users%`, `%users%['[s]] mention[s]`,
		`[the] mention[s] of %members%`, `%members%['[s]] mention[s]`,
		`[the] mention[s] of %channels%`, `%channels%['[s]] mention[s]`,
		`[the] mention[s] of %roles%`, `%roles%['[s]] mention[s]`],
	run: async (options, object) => {
		if(options.matchIndex <= 7) return object.mention;
		else throw new options.TagError("Match index was out of range");
	}
};
