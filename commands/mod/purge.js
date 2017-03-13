exports.cmd = new Oxyl.Command("purge", async message => {
	let deletePerms = message.channel.guild.members.get(bot.user.id).permission.has("manageMessages");
	if(!deletePerms) {
		let msg = await message.channel.createMessage("Oxyl does not have permissions to delete messages");
		setTimeout(() => msg.delete(), 3000);
		return false;
	} else {
		await message.delete();
		if(message.args[1]) {
			let filterList = ["bots", "images", "files", "embeds", "includes", "contains", "links", "users", "from", "matches"];
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
							users[i] = await Oxyl.modScripts.commandArgs.test(users[i], { type: "user" }, message);
							users[i] = users[i].id;
						} catch(err) {
							return `${err.message} (user #${i})`;
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

			message.channel.purge(message.args[0], msg => {
				if(filtersActive.bots && msg.author.bot) return true;
				else if(filtersActive.images && msg.attachments.length >= 1 && msg.attachments[0] && msg.attachments[0].width) return true;
				else if(filtersActive.files && msg.attachments.length >= 1 && msg.attachments[0] && !msg.attachments[0].width) return true;
				else if(filtersActive.embeds && msg.embeds.length >= 1) return true;
				else if(filtersActive.users && filtersActive.users.includes(msg.author.id)) return true;
				else if(filtersActive.includes && ~msg.content.toLowerCase().indexOf(filtersActive.includes)) return true;
				else if(filtersActive.links && (new RegExp(framework.config.options.linkFilter), "im").test(msg.content)) return true;
				else if(filtersActive.matches && msg.content.match(new RegExp(filtersActive.matches, "im"))) return true;
				else return false;
			});
		} else {
			message.channel.purge(message.args[0], msg => true);
		}
		return false;
	}
}, {
	perm: "manageMessages",
	guildOnly: true,
	type: "moderator",
	aliases: ["prune"],
	description: "Delete up to 2500 messages with optional filters",
	args: [{
		type: "int",
		min: 1,
		max: 2500,
		label: "limit"
	}, {
		type: "custom",
		optional: true,
		label: "filters (bots, images, files, embeds, links, from <users...>, includes <text>, matches <regex>)"
	}]
});
