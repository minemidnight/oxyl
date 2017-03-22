const express = require("express"),
	handlebars = require("handlebars"),
	main = require("../website.js");
const router = express.Router(); // eslint-disable-line new-cap
const sqlQueries = Oxyl.modScripts.sqlQueries;

router.get("*", async (req, res) => {
	let data = {};
	let path = req.path;
	if(path.endsWith("/")) path = path.substring(0, path.length - 1);
	if(path.endsWith("/bans") || path.endsWith("/punishments") || path.endsWith("/infractions") || path.endsWith("/modlog")) {
		var punishments = true;
		path = path.substring(0, path.lastIndexOf("/"));
	}
	let guild = path.substring(1);

	if(bot.guilds.has(guild)) {
		guild = bot.guilds.get(guild);
		guild.subname = guild.name.split(" ").map(str => str.charAt(0)).join("");
		guild.owner = guild.members.get(guild.ownerID);
		guild.onlineCount = guild.members.filter(gM => gM.status === "online").length;
		guild.botCount = guild.members.filter(gM => gM.bot).length;
		guild.botPercent = ((guild.botCount / guild.memberCount) * 100).toFixed(2);
		guild.userCount = guild.memberCount - guild.botCount;
		guild.userPercent = ((guild.userCount / guild.memberCount) * 100).toFixed(2);
		data.punishments = await Oxyl.modScripts.modLog.getCases(guild);
		data.guild = guild;

		if(main.tokens[req.sessionID]) {
			let user = await main.getInfo(req.sessionID, "users/@me");
			let member = guild.members.get(user.id);
			if(member && (framework.guildLevel(member) >= 3 || framework.config.creators.includes(user.id))) data.panel = true;
			if(member && (framework.guildLevel(member) >= 2 || framework.config.creators.includes(user.id))) data.cases = true;

			let settings = await sqlQueries.dbQuery(`SELECT * FROM Settings WHERE ID = "${guild.id}"`);
			let possibleSettings = Oxyl.cmdScripts.settings.settings;
			data.settings = settings.filter(setting => possibleSettings.find(set => set.name === setting.NAME)).map(setting => {
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
		}
	}

	if(punishments) res.send(await main.parseHB("punishments", req, data));
	else res.send(await main.parseHB("guild", req, data));
	res.end();
});

router.post("/set_case", async (req, res) => {
	if(!main.tokens[req.sessionID]) {
		res.send(`{"error": "Not logged"}`);
		res.end();
		return;
	}

	if(!req.body.case || !req.body.guildid || !req.body.reason || isNaN(parseInt(req.body.case))) {
		res.send(`{"error": "Invalid fields"}`);
		res.end();
		return;
	}

	let guild = bot.guilds.get(req.body.guildid);
	if(!guild) {
		res.send(`{"error": "Invalid guild"}`);
		res.end();
		return;
	}

	let user = await main.getInfo(req.sessionID, "users/@me");
	if(!guild.members.has(user.id)) {
		res.send(`{"error": "User not in guild or not cached"}`);
		res.end();
		return;
	} else if(framework.guildLevel(guild.members.get(user.id)) < 2) {
		res.send(`{"error": "Invalid Perms"}`);
		res.end();
		return;
	}

	let resp = await Oxyl.modScripts.modLog.setReason(guild, parseInt(req.body.case), req.body.reason, guild.members.get(user.id));
	if(resp === "SUCCESS") resp = `{"success": "Reason set successfully"}`;
	else if(resp === "NO_CASE") resp = `{"error": "Case not found"}`;
	else if(resp === "NO_CHANNEL") resp = `{"error": "No mod log channel"}`;
	else if(resp === "NO_MSG") resp = `{"error": "Can't get Discord Message from case"}`;
	else resp = `{"error": "Unexpected Error"}`;

	res.send(resp);
	res.end();
	return;
});

router.post("/update", async (req, res) => {
	let guild = bot.guilds.get(req.body.guildid);
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
		if(req.body[key] !== "undefined" && req.body[key] !== "") await sqlQueries.settings.set(guild, key, req.body[key]);
		else deleteSettings.push(key);
	}
	if(deleteSettings.indexOf("prefix") !== -1) delete Oxyl.modScripts.commandHandler.prefixes[guild.id];
	await sqlQueries.dbQuery(`DELETE from Settings WHERE NAME IN ("${deleteSettings.join(`","`)}") AND ID = "${guild.id}"`);

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

const actions = ["BAN", "UNBAN", "KICK", "MUTE", "UNMUTE"];
const actionIcons = ["gavel", "group_add", "exit_to_app", "volume_off", "volume_up"];
handlebars.registerHelper("listPunishments", (guild, bans, allowedEdit) => {
	let returnstr = "", i = 1;
	bans.reverse();
	bans.forEach(ban => {
		let action = actions[ban.ACTION];
		action = framework.capitalizeEveryFirst(action.toLowerCase());

		returnstr += `<div class="w3-container w3-card-4 w3-round w3-section w3-card-4 w3-padding" id="ban-${i}">`;
		returnstr += `<span style="text-decoration:underline">CASE #${ban.CASE_NUM}</span>`;
		returnstr += `<p><span>ACTION:</span> ${action}<i class="material-icons w3-right">${actionIcons[ban.ACTION]}</i></p>`;
		returnstr += `<p><span>USER:</span> ${ban.USER}</p>`;
		if(!ban.REASON) {
			if(allowedEdit) returnstr += `<p><span>REASON:</span> <input class="w3-input" type="text" placeholder="Not set" /></p>`;
			else returnstr += `<p><span>REASON:</span> Not set</p>`;
		} else {
			if(allowedEdit) returnstr += `<p><span>REASON:</span> <input class="w3-input" type="text" value="${ban.REASON}" /></p>`;
			else returnstr += `<p><span>REASON:</span> ${ban.REASON}</p>`;
			returnstr += `<p><span>MOD:</span> ${guild.members.has(ban.RESPONSIBLE) ? framework.unmention(guild.members.get(ban.RESPONSIBLE)) : ban.RESPONSIBLE}</p>`;
		}
		if(allowedEdit) returnstr += `<button onclick="updateCase(${i})" class="w3-center w3-btn w3-right w3-margin">Update</button>`;
		returnstr += "</div>";
		i++;
	});

	return new handlebars.SafeString(returnstr);
});
