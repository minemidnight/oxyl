const tags = Oxyl.modScripts.tagModule;
exports.cmd = new Oxyl.Command("tag", async message => {
	let msg = message.argsPreserved[0];
	let guild = message.channel.guild, channel = message.channel, user = message.author;
	if(msg.toLowerCase() === "list") {
		let tagTypes = await tags.getTags(message);
		let tagMsg = "";
		for(let type in tagTypes) {
			let tagNames = [];
			for(let i in tagTypes[type]) {
				tagNames.push(tagTypes[type][i].NAME);
			}
			tagNames.sort();

			tagMsg += `${framework.capitalizeEveryFirst(type)} Tags **(${tagNames.length})**: `;
			tagMsg += `\`${tagNames.length >= 1 ? tagNames.join("`**,** `") : "None"}\`\n`;
		}

		tagMsg += "\nThis excludes other users, other channel and other server tags.\n" +
								"To view unlisted tags, use `tag listu`.";

		return tagMsg;
	} else if(msg.toLowerCase().startsWith("listu")) {
		let taglist = await tags.getUnlistedTags();
		let maxPages = Math.ceil(taglist.length / 100);
		let page = parseInt(msg.substring(5).trim()) || 1;
		if(page > maxPages) page = maxPages;

		let tagMsg = `Found ${taglist.length} total unlisted tags.\nPage ${page} of ${maxPages}:`;

		if(taglist.length > 0) {
			let tagNames = [];
			for(let i = 0; i < 100; i++) {
				let index = ((page - 1) * 100) + i;
				tagNames.push(taglist[index].NAME);
				if(taglist.length - 1 === index || i === 99) break;
			}
			tagMsg += `${framework.codeBlock(tagNames.join(","))}`;
		} else {
			tagMsg = "No unlisted tags";
		}

		return tagMsg;
	} else if(msg.toLowerCase().startsWith("delete")) {
		let name = msg.split(" ", 2)[1], deletable, tag;
		let level = framework.guildLevel(message.member);
		if(!name) return "Please provide the name of the tag you'd like to delete, `tag delete [name]`";
		name = name.toLowerCase();

		try {
			tag = await tags.getTag(name, message);
		} catch(err) {
			return "That tag does not exist";
		}

		if(level >= 4) deletable = true;
		else if(tag.TYPE === "guild" && level >= 3) deletable = true;
		else if(tag.TYPE === "guild" && level >= 2 && tag.CREATOR === user.id) deletable = true;
		else if(tag.TYPE === "channel" && level >= 2) deletable = true;
		else if(tag.TYPE === "channel" && level >= 1 && tag.CREATOR === user.id) deletable = true;
		else if(tag.CREATOR === user.id) deletable = true;

		if(!deletable) {
			return "You can't delete that tag (not enough perms, and not the tag creator)";
		} else {
			tags.deleteTag(tag.TYPE, name, message);
			return "Tag deleted";
		}
	} else if(msg.toLowerCase().startsWith("create")) {
		let name = msg.split(" ", 2)[1], type, exists = true, tag;
		let level = framework.guildLevel(message.member);
		if(!name) return "Your tag needs a name, `tag create [name] [content] [type (default user)]`";
		name = name.toLowerCase();

		try {
			tag = await tags.getTag(name, message);
		} catch(err) {
			exists = false;
		}

		if(exists) return "That tag already exists. Please delete it, then try again";

		let createData = {
			creator: user.id,
			createdAt: Date.now(),
			name: name
		};

		if(msg.toLowerCase().endsWith("-global")) {
			createData.type = "global";

			if(level < 4) return "You do not have enough permissions to create a global tag, try an unlisted.";
		} else if(msg.toLowerCase().endsWith("-guild") || msg.toLowerCase().endsWith("-server")) {
			createData.type = "guild";
			createData.id = guild.id;

			if(level < 2) return "You do not have enough permissions to create a guild tag";
		} else if(msg.toLowerCase().endsWith("-channel")) {
			createData.type = "channel";
			createData.id = channel.id;

			if(level < 1) return "You do not have enough permissions to create a channel tag";
		} else if(msg.toLowerCase().endsWith("-unlisted")) {
			createData.type = "unlisted";
		} else {
			createData.type = "user";
		}

		let content;
		if(createData.type === "user" && !msg.endsWith("-user")) content = msg.substring(7 + name.length);
		else content = msg.substring(7 + name.length, msg.lastIndexOf("-"));
		content = content.trim();
		if(!content || content.length === 0) return "Tag must have content";

		createData.content = content;
		tags.createTag(createData);
		return `Tag \`${name}\` created (type: \`${createData.type}\`)`;
	} else if(msg.toLowerCase().startsWith("test")) {
		msg = msg.substring(4).trim();
		if(!msg || msg === "") return "You must provide tag content to test";
		return await tags.executeTag(msg, message);
	} else if(msg.toLowerCase().startsWith("raw")) {
		let name = msg.split(" ", 2)[1], tag;
		if(!name) return "Please provide the name of the tag you'd like to see, `tag raw [name]`";
		name = name.toLowerCase();

		try {
			tag = await tags.getTag(name, message);
		} catch(err) {
			return "No tag found";
		}

		return framework.codeBlock(tag.CONTENT);
	} else if(msg.toLowerCase().startsWith("info")) {
		let name = msg.split(" ", 2)[1], tag;
		if(!name) return "Please provide the name of the tag you'd like to see, `tag info [name]`";
		name = name.toLowerCase();

		try {
			tag = await tags.getTag(name, message);
		} catch(err) {
			return "No tag found";
		}

		let data = [
			`Creator: ${framework.unmention(bot.users.get(tag.CREATOR))}`,
			`Created At: ${framework.formatDate(parseInt(tag.CREATED_AT))}`,
			`Type: ${framework.capitalizeEveryFirst(tag.TYPE)}`,
			`Uses: ${tag.USES}`
		];

		return `Tag **${name}**: ${framework.listConstructor(data)}`;
	} else {
		let name = msg.split(" ", 1)[0], tag, parsed;
		if(!name) return "Please provide the name of the tag you'd like to see, `tag [name]`";
		name = name.toLowerCase();

		try {
			tag = await tags.getTag(name, message);
		} catch(err) {
			return "No tag found";
		}

		tags.addUse(tag.TYPE, tag.NAME, message);
		return await tags.executeTag(tag.CONTENT, message);
	}
}, {
	guildOnly: true,
	cooldown: 2500,
	type: "default",
	aliases: ["t", "tags"],
	description: "Create, delete, display, test or list tags (view http://minemidnight.work/tags for tag info)",
	args: [{
		type: "text",
		label: "<tag name>|test <content>|create <name> <content>|delete <name>|list|raw <name>|info <name>"
	}]
});
