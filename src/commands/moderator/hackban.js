const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let banPerms = message.channel.guild.members.get(bot.user.id).permission.has("banMembers");
		if(!banPerms) return "I am missing the permission to ban members!";

		if(!message.args[0].match(/^\d{17,21}$/)) return "Invalid user id!";
		let member = message.channel.guild.members.get(message.args[0]);
		if(member) return "That user is in the guild, please ban them normally!";


		if(message.args[1]) {
			let guild = message.channel.guild;
			let channel = await modLog.channel(guild);
			if(channel) {
				modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[1] };
			}
		}

		message.channel.guild.banMember(message.args[0], 7);
		let display = bot.users.has(message.args[0]) ? bot.users.get(message.args[0]).username : `\`${message.args[0]}\``;
		return `${display} has been banned`;
	},
	guildOnly: true,
	perm: "banMembers",
	description: "Ban a user from not in the guild by their ID",
	args: [{
		type: "text",
		label: "user id"
	}, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
