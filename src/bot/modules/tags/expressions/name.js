module.exports = {
	name: "Name of user/member/channel/server/role",
	description: "Name of a user/member/channel/server/role",
	examples: [`set {_name} to name of server`],
	patterns: [`[the] [user]name[s] of %users%`, `%users%['[s]] [user]name[s]`,
		`[the] [user]name[s] of %members%`, `%members%['[s]] [user]name[s]`,
		`[the] name[s] of %channels%`, `%channels%['[s]] name[s]`,
		`[the] name[s] of %servers%`, `%servers%['[s]] name[s]`,
		`[the] name[s] of %roles%`, `%roles%['[s]] name[s]`],
	returns: "text",
	run: async (options, object) => {
		if(~[0, 1].indexOf(options.matchIndex)) return object.username;
		else if(~[2, 3].indexOf(options.matchIndex)) return object.user.username;
		else if(~[3, 4, 5, 6, 7, 8, 9, 10].indexOf(options.matchIndex)) return object.name;
		else throw new options.TagError("Match index was out of range");
	}
};
