let linkFilter = /^((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/im; // eslint-disable-line max-len
module.exports = {
	process: async message => {
		let deletePerms = message.channel.guild.members.get(bot.user.id).permission.has("manageMessages");
		if(!deletePerms) {
			let msg = await message.channel.createMessage(__("commands.moderator.purge.noPerms", message));
			setTimeout(() => msg.delete(), 3000);
		} else if(message.args[1]) {
			await message.delete();
			let filterList = ["bots", "images", "files", "embeds", "includes", "contains",
				"links", "users", "from", "matches"];
			let filtersActive = {};
			let filters = message.args[1].split(",").map(filter => filter.toLowerCase().trim());
			for(let filter of filters) {
				let filterName = !~filter.indexOf(" ") ? filter : filter.split(" ")[0];
				if(!filterList.includes(filterName)) {
					delete filters[filters.indexOf(filter)];
					continue;
				}

				if(filterName === "from" || filterName === "users") {
					let users = filter.substring(filterName.length).trim().split(" ");
					for(let i = 0; i < users.length; i++) {
						try {
							users[i] = (await bot.utils.resolver.user(message, users[i])).id;
						} catch(err) {
							let msg = await message.channel.createMessage(`${err.message} (user #${i})`);
							setTimeout(() => msg.delete(), 3000);
							return;
						}
					}
					filtersActive.users = users;
				} else if(filterName === "includes" || filterName === "contains") {
					filtersActive.includes = filter.substring(filterName.length).trim();
				} else if(filterName === "matches") {
					filtersActive.matches = filter.substring(filterName.length).trim();
				} else {
					filtersActive[filterName] = true;
				}
			}

			await message.channel.purge(message.args[0], msg => {
				if(filtersActive.bots && msg.author.bot) return true;
				else if(filtersActive.images && msg.attachments[0] && msg.attachments[0].width) return true;
				else if(filtersActive.files && msg.attachments[0] && !msg.attachments[0].width) return true;
				else if(filtersActive.embeds && msg.embeds.length >= 1) return true;
				else if(filtersActive.users && filtersActive.users.includes(msg.author.id)) return true;
				else if(filtersActive.includes && ~msg.content.toLowerCase().indexOf(filtersActive.includes)) return true;
				else if(filtersActive.links && linkFilter.test(msg.content)) return true;
				else if(filtersActive.matches && msg.content.match(new RegExp(filtersActive.matches, "im"))) return true;
				else return false;
			});
		} else {
			await message.delete();
			await message.channel.purge(message.args[0]);
		}

		let msg = await message.channel.createMessage("👌");
		setTimeout(() => msg.delete(), 3000);
	},
	guildOnly: true,
	perm: "manageMessages",
	aliases: ["prune"],
	description: "Delete up to 2500 with optional filters",
	args: [{
		type: "num",
		min: 1,
		max: 2500,
		label: "limit"
	}, {
		type: "text",
		optional: true,
		label: "filters (bots, images, files, embeds, links, from <users...>, includes <text>, matches <regex>)"
	}]
};
