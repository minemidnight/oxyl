module.exports = {
	name: "Creation date of user/member/message/channel/server/role",
	description: "The creation date of a user/member/message/channel/server/role",
	examples: [`return "You made your account on %formatted date of event-message's author creation date%"`],
	patterns: [`[the] creation (date|time[stamp])[s] of %users%`, `%users%['[s]] creation (date|time[stamp])[s]`,
		`[the] creation (date|time[stamp])[s] of %membesr%`, `%members%['[s]] creation (date|time[stamp])[s]`,
		`[the] creation (date|time[stamp])[s] of %messages%`, `%messages%['[s]] creation (date|time[stamp])[s]`,
		`[the] creation (date|time[stamp])[s] of %channels%`, `%channels%['[s]] creation (date|time[stamp])[s]`,
		`[the] creation (date|time[stamp])[s] of %servers%`, `%servers%['[s]] creation (date|time[stamp])[s]`,
		`[the] creation (date|time[stamp])[s] of %roles%`, `%roles%['[s]] creation (date|time[stamp])[s]`],
	run: async (options, object) => {
		if(options.matchIndex <= 11) return object.createdAt;
		else throw new options.TagError("Match index was out of range");
	}
};
