module.exports = {
	name: "User from ID",
	description: "A user based off their ID",
	examples: [`set {_user} to user from id "138802943653576705"`],
	patterns: [`[the] user[s] from id[s] %texts%`],
	returns: "user",
	run: async (options, id) => bot.users.get(id)
};
