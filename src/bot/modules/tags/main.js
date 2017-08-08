const run = require(`${__dirname}/run`);
module.exports = {
	get: async name => r.table("tags").get(name).run(),
	getByUser: async userID => r.table("tags").getAll(userID, { index: "ownerID" }).run(),
	create: async (name, ownerID, content) => await r.table("tags").insert({ name, ownerID, content }).run(),
	update: async (name, content) => await r.table("tags").get(name).update({ content }).run(),
	delete: async name => await r.table("tags").get(name).delete().run(),
	run: async (message, content) => {
		try {
			await run({ __message: message }, content);
		} catch(err) {
			message.channel.createMessage(`Error running tag!\n${(err.stack)}`);
		}
	}
};

module.exports.run({
	author: { id: "123", username: "n" },
	channel: { createMessage: (content) => console.log("message", content) }
}, require("fs").readFileSync(`${__dirname}/tag.txt`, "utf8"));
