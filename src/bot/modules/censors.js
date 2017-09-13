const modLog = require("../modules/modLog.js");
module.exports = async message => {
	let censors = bot.censors.get(message.channel.guild.id);
	if(!censors || !message.member) return;
	else if(message.member.permission.has("manageMessages")) return;

	for(let censor of Array.from(censors.values())) {
		if(!message.content.match(new RegExp(censor.regex, "i"))) return;
		message.delete();
		message.channel.createMessage(__("modules.censor", message.channel.guild, { mention: message.author.mention }));

		if(censor.action === "warn") {
			await bot.utils.warnMember(message.member, bot.user, "Said a censored phrase");
		} else if(censor.action === "kick") {
			let channel = await modLog.channel(message.channel.guild);
			if(channel) {
				modLog.presetReasons[message.channel.guild.id] = { mod: bot.user, reason: "Said a censored phrase" };
			}

			await message.member.kick("Said a censored phrase");
			modLog.create(message.channel.guild, "kick", message.author);
		} else if(censor.action === "softban") {
			let channel = await modLog.channel(message.channel.guild);
			if(channel) {
				modLog.presetReasons[message.channel.guild.id] = { mod: bot.user, reason: "Said a censored phrase" };
			}

			await message.member.ban(7, "Said a censored phrase");
			await message.member.unban("Softban");
		} else if(censor.action === "ban") {
			let channel = await modLog.channel(message.channel.guild);
			if(channel) {
				modLog.presetReasons[message.channel.guild.id] = { mod: bot.user, reason: "Said a censored phrase" };
			}

			await message.member.ban(7, "Said a censored phrase");
		}

		break;
	}
};
