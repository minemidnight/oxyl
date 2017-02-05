const express = require("express"),
	framework = require("../../framework.js"),
	handlebars = require("handlebars"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("*", async (req, res) => {
	let data = {};
	let guild = req.path.substring(1);

	if(Oxyl.bot.guilds.has(guild)) {
		guild = Oxyl.bot.guilds.get(guild);
		guild.subname = guild.name.split(" ").map(str => str.charAt(0)).join("");
		guild.owner = guild.members.get(guild.ownerID);
		guild.onlineCount = guild.members.filter(gM => gM.status === "online").length;
		guild.botCount = guild.members.filter(gM => gM.bot).length;
		guild.botPercent = ((guild.botCount / guild.memberCount) * 100).toFixed(2);
		guild.userCount = guild.memberCount - guild.botCount;
		guild.userPercent = ((guild.userCount / guild.memberCount) * 100).toFixed(2);
		data.guild = guild;

		if(main.tokens[req.sessionID]) {
			let user = await main.getInfo(req.sessionID, "users/@me");
			let member = guild.members.get(user.id);
			if(member && (framework.guildLevel(member) >= 3 || framework.config.creators.includes(user.id))) data.panel = true;

			let settings = await framework.dbQuery(`SELECT * FROM \`Settings\` WHERE \`ID\` = '${guild.id}'`);
			let possibleSettings = Oxyl.cmdScripts.settings.settings;
			data.settings = settings.map(setting => {
				let settingFound = possibleSettings.find(set => set.name === setting.NAME);
				setting.TYPE = settingFound.type;

				if(setting.TYPE === "textChannel") {
					if(guild.channels.has(setting.VALUE)) setting.valueDisplay = guild.channels.get(setting.VALUE).name;
					else setting.valueDisplay = "deleted-channel";
				} else {
					setting.valueDisplay = setting.VALUE;
				}

				return setting;
			});

			for(let i of possibleSettings) {
				if(data.settings.find(set => set.NAME === i.name)) continue;
				data.settings.push({
					NAME: i.name,
					VALUE: undefined,
					valueDisplay: "",
					placeholder: "Not set",
					TYPE: i.type
				});
			}

			// let roleme = await framework.getRoles(guild, "me");
			// data.roleme = roleme.map(role => guild.roles.get(role.ID) || "Deleted Role");
			// let autorole = await framework.getRoles(guild, "auto");
			// data.autorole = autorole.map(role => guild.roles.get(role.ID) || "Deleted Role");
		}
	}

	res.send(await main.parseHB("guild", req, data));
	res.end();
});

router.post("/update", async (req, res) => {
	let guild = Oxyl.bot.guilds.get(req.body.guildid);
	delete req.body.guildid;
	if(!guild || !main.tokens[req.sessionID]) {
		res.redirect("http://minemidnight.work/select");
		return;
	}

	let user = await main.getInfo(req.sessionID, "users/@me");
	if(guild.members.get(user.id) && framework.guildLevel(guild.members.get(user.id)) < 3) {
		res.redirect("http://minemidnight.work/select");
		return;
	}

	let deleteSettings = [];
	for(let key in req.body) {
		if(req.body[key] !== "undefined" && req.body[key] !== "") await framework.setSetting(guild, key, req.body[key]);
		else deleteSettings.push(key);
	}
	if(deleteSettings.indexOf("prefix") !== -1) delete Oxyl.modScripts.commandHandler.prefixes[guild.id];
	await framework.dbQuery(`DELETE from \`Settings\` WHERE \`NAME\` IN ('${deleteSettings.join("','")}') AND \`ID\` = '${guild.id}'`);

	res.redirect(`http://minemidnight.work/guild/${guild.id}`);
	res.end();
});

module.exports = router;

handlebars.registerHelper("createInput", (settings, guild) => {
	let returnstr = `<input type="hidden" name="guildid" value="${guild.id}" style="display:none" />`;
	settings.forEach(setting => {
		returnstr += `<label class="w3-label">${setting.NAME}</label>`;
		if(setting.TYPE === "text") {
			returnstr += `<input class="w3-input" name="${setting.NAME}" value="${setting.valueDisplay}"` +
				`${setting.placeholder ? `placeholder="${setting.placeholder}"` : ""} type="text" />`;
		}	else if(setting.TYPE === "tag") {
			returnstr += `<textarea class="w3-input" name="${setting.NAME}" style="max-width:100%;max-height:200px;"` +
				`${setting.placeholder ? `placeholder="${setting.placeholder}"` : ""}>${setting.valueDisplay}</textarea>`;
		}	else if(setting.TYPE === "textChannel") {
			returnstr += `<select class="w3-select" name="${setting.NAME}">`;
			returnstr += `<option value="undefined" ${setting.VALUE === undefined ? "selected" : ""}>None</option>`;

			returnstr += guild.channels
				.filter(channel => channel.type === 0)
				.map(channel => `<option value="${channel.id}" ${setting.VALUE === channel.id ? "selected" : ""}>${channel.name}</option>`)
				.join("");
			returnstr += `</select>`;
		}
	});

	return new handlebars.SafeString(returnstr);
});

handlebars.registerHelper("listChannels", guild => {
	let returnstr = "";
	guild.channels.forEach(channel => {
		returnstr += `<input class="w3-check" type="checkbox" value="${channel.id}" name="channels" checked />`;
		returnstr += `<label class="w3-validate">${channel.name}</label>`;
	});

	return new handlebars.SafeString(returnstr);
});
