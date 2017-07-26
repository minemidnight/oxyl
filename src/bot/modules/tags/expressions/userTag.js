module.exports = {
	name: "Tag of User/Member",
	description: "The 'tag' of a member or user (username#discriminator)",
	examples: [`set {_tag} to tag of author of event-message`],
	patterns: [`[the] tag[s] of %users%`, `%users%['[s]] tag[s]`,
		`[the] tag[s] of %members%`, `%members%['[s]] tag[s]`],
	run: async (options, type) => {
		if(~[0, 1].indexOf(options.matchIndex)) return `${type.username}#${type.discriminator}`;
		else if(~[2, 3].indexOf(options.matchIndex)) return `${type.user.username}#${type.user.discriminator}`;
		else throw new options.TagError("Match index was out of range");
	}
};
