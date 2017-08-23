const run = require(`${__dirname}/run`);
module.exports = {
	get: async name => r.table("tags").get(name).run(),
	getByUser: async userID => r.table("tags").getAll(userID, { index: "ownerID" }).run(),
	create: async (name, ownerID, content, type = "plain") => {
		await r.table("tags").insert({ name, ownerID, content, type }).run();
	},
	update: async (name, content, type = "plain") => await r.table("tags").get(name).update({ content, type }).run(),
	delete: async name => await r.table("tags").get(name).delete().run(),
	list: async page => await r.table("tags").skip(page).limit(100).run(),
	run: async (message, content, customCommand = false) => {
		try {
			await run({ __message: message, customCommand }, content);
		} catch(err) {
			throw err;
		}
	}
};
