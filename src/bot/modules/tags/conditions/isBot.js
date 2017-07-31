module.exports = {
	name: "User/Member is bot",
	description: "Check if a member/user is a bot",
	examples: [`if author of message is a bot:\n" +
		"\treturn "Only user accounts can use this tag!"\nend`],
	patterns: [`%user% (is|are) [a[n]] bot[s]`, `%members% (is|are) [a[n]] bot[s]`],
	run: async (options, type) => {
		if(~[0, 1].indexOf(options.matchIndex)) return type.bot;
		else throw new options.TagError("Match index was out of range");
	}
};
