module.exports = {
	run: ({ args: [user], author, flags: { static } }) => {
		if(!user) user = author;
		return static ? user.staticAvatarURL : user.avatarURL;
	},
	args: [{ type: "user", optional: true }],
	flags: [{
		name: "static",
		short: "s",
		type: "boolean",
		default: false
	}]
};
