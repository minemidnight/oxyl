module.exports = {
	name: "ID of user/member/message/channel/server/role",
	description: "ID of a user/member/message/channel/server/role",
	examples: [`set {_id} to id of server`],
	patterns: [`[the] id[s] of %users%`, `%users%['[s]] id[s]`,
		`[the] id[s] of %members%`, `%members%['[s]] id[s]`,
		`[the] id[s] of %messages%`, `%messages%['[s]] id[s]`,
		`[the] id[s] of %channels%`, `%channels%['[s]] id[s]`,
		`[the] id[s] of %servers%`, `%servers%['[s]] id[s]`,
		`[the] id[s] of %roles%`, `%roles%['[s]] id[s]`],
	run: async (options, object) => {
		if(options.matchIndex <= 11) return object.id;
		else throw new options.TagError("Match index was out of range");
	}
};
