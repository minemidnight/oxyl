const tags = require("../../modules/tags.js");
module.exports = {
	process: async message => {
		let arg = message.args[0];
		if(arg.toLowerCase() === "list") {
			let page = 1;
			if(~arg.indexOf(" ")) page = parseInt(arg.substring(arg.indexOf(" ") + 1));
			if(isNaN(page) || page < 1) page = 1;

			let tagList = await tags.list(page);
			if(!tagList.length) {
				return __("commands.default.tags.list.noTags", message);
			} else {
				tagList = tagList.map(tag => tag.name).join(", ");
				return __("commands.default.tags.list.success", message, { page, tags: tagList });
			}
		} else if(arg.toLowerCase().startsWith("raw")) {
			if(!~arg.indexOf(" ")) return __("commands.default.tags.raw.noTag", message);

			let tagName = arg.substring(arg.indexOf(" ") + 1).toLowerCase();
			let tag = await tags.get(tagName);
			if(!tag) return __("commands.default.tags.noTagFound", message, { name: tagName });

			let content = tag.content.replace(/```/g, "\\`\\`\\`");
			return __("commands.default.tags.raw.success", message, { content, name: tagName });
		} else if(arg.toLowerCase().startsWith("delete")) {
			if(!~arg.indexOf(" ")) return __("commands.default.tags.delete.noTag", message);

			let tagName = arg.substring(arg.indexOf(" ") + 1).toLowerCase();
			let tag = await tags.get(tagName);
			if(!tag) return __("commands.default.tags.noTagFound", message, { name: tagName });
			else if(tag.ownerID !== message.author.id) return __("commands.default.tags.delete.notOwner");

			await tags.delete(tagName);
			return __("commands.default.tags.delete.success", message, { name: tagName });
		} else if(arg.toLowerCase().startsWith("create")) {
			if(!~arg.indexOf(" ")) return __("commands.default.tags.create.noArgs", message);

			let tagName = arg.substring(arg.indexOf(" ") + 1);
			let content = tagName.substring(tagName.indexOf(" ") + 1);
			tagName = tagName.substring(0, tagName.indexOf(" ")).toLowerCase();
			if(!tagName || !content || !content.length) return __("commands.default.tags.create.noContent", message);

			let tag = await tags.get(tagName);
			if(tag) return __("commands.default.tags.create.alreadyExists", message, { name: tagName });

			await tags.create(tagName, message.author.id, content);
			return __("commands.default.tags.create.success", message, { name: tagName });
		} else {
			let tagName = arg.toLowerCase();
			let tag = await tags.get(tagName);
			if(!tag) return __("commands.default.tags.noTagFound", message, { name: tagName });

			return tag.content;
		}
	},
	caseSensitive: true,
	description: "Create, delete, display, and use tags",
	aliases: ["t", "tag"],
	args: [{
		type: "text",
		label: "<tag name>|list [<page>]|raw <name>|delete <name>|create <name> <content>"
	}]
};
