module.exports = {
	name: "Avatar of User/Member",
	description: "The avatar url of a member or user",
	examples: [`set {_avatar} to avatar of author of event-message`],
	patterns: [`[the] avatar[s] [(link|url)][s] of %users%`, `%users%['[s]] avatar[s] [(link|url)][s]`,
		`[the] avatar[s] [(link|url)][s] of %members%`, `%members%['[s]] avatar[s] [(link|url)][s]`],
	run: async (options, type) => {
		if(~[0, 1].indexOf(options.matchIndex)) return type.avatarURL;
		else if(~[2, 3].indexOf(options.matchIndex)) return type.user.avatarURL;
		else throw new options.TagError("Match index was out of range");
	}
};
