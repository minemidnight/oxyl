const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

let tags = {
	user: [],
	channel: [],
	guild: [],
	global: []
};
exports.tags = tags;

function parseTag(tag) {
	tag = tag.content;
	return new Promise((resolve, reject) => {
		resolve(tag);
	});
}

var command = new Command("tag", (message, bot) => {
	let msg = message.argsPreserved[0];
	let guild = message.guild, channel = message.channel, user = message.author;
	if(msg.toLowerCase().startsWith("create")) {
		let name = msg.split(" ", 2)[1].toLowerCase(), type, path, priority;
		if(!name) return "Your tag needs a name, `tag create [name] [content] [type (default user)]`";

		if(msg.toLowerCase().endsWith("-global")) {
			type = "global";
			path = tags;
		} else if(msg.toLowerCase().endsWith("-guild") || msg.toLowerCase().endsWith("-server")) {
			type = "guild";
			path = guild.id;
		} else if(msg.toLowerCase().endsWith("-channel")) {
			type = "channel";
			path = channel.id;
		} else {
			type = "user";
			path = user.id;
		}

		let content;
		if(type === "user" && !msg.endsWith("-user")) {
			content = msg.substring(7 + name.length);
		} else {
			content = msg.substring(7 + name.length, msg.lastIndexOf("-"));
		}
		content = content.trim();
		if(!content || content.length === 0) return "Tag must have content";
		else if(content.length < 5) return "Content of tag must be 5 characters or more";

		if(!tags[type][path]) tags[type][path] = {};
		tags[type][path][name] = {
			creator: user.id,
			name: name,
			type: type,
			createdAt: new Date(),
			content: content
		};

		return `Tag \`${name}\` created (type: \`${type}\`)`;
	} else {
		let tag;
		msg = msg.toLowerCase();

		if(tags.global[msg]) tag = tags.global[msg];
		else if(tags.guild[guild.id] && tags.guild[guild.id][msg]) tag = tags.guild[guild.id][msg];
		else if(tags.channel[channel.id] && tags.channel[channel.id][msg]) tag = tags.channel[channel.id][msg];
		else if(tags.user[user.id] && tags.user[user.id][msg]) tag = tags.user[user.id][msg];

		if(!tag) {
			return "No tag found";
		} else {
			parseTag(tag).then(parsed => {
				message.channel.createMessage(parsed);
			});
			return false;
		}
	}
}, {
	type: "default",
	aliases: ["t"],
	description: "Create or display a tag",
	args: [{
		type: "text",
		label: "tag name/create"
	}]
});
