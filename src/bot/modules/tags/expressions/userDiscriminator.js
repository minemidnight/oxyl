module.exports = {
	name: "Discriminator of User/Member",
	description: "The discriminator of a member or user",
	examples: [`set {_discrim} to discrim of author of event-message`],
	patterns: [`[the] discrim[inator][s] of %users%`, `%users%['[s]] discrim[inator][s]`,
		`[the] discrim[inator][s] of %members%`, `%members%['[s]] discrim[inator][s]`],
	returns: "text",
	run: async (options, type) => {
		if(~[0, 1].indexOf(options.matchIndex)) return type.discriminator;
		else if(~[2, 3].indexOf(options.matchIndex)) return type.user.discriminator;
		else throw new options.TagError("Match index was out of range");
	}
};
