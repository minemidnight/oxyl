module.exports = {
	get: async name => r.table("tags").get(name).run(),
	getByUser: async userID => r.table("tags").getAll(userID, { index: "ownerID" }).run(),
	create: async (name, ownerID, content) => await r.table("tags").insert({ name, ownerID, content }).run(),
	update: async (name, content) => await r.table("tags").get(name).update({ content }).run(),
	delete: async name => await r.table("tags").get(name).delete().run(),
	list: async page => await r.table("tags").skip(page).limit(100).run()
};
