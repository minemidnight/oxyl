const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let cases = [], casecount = (await modLog.cases(message.channel.guild)).length;
		if(casecount.length === 0) return __("commands.moderator.reason.noCases", message);

		if(message.args[0].indexOf("-") !== -1) {
			let match = message.args[0].match(/((?:\d|l(?:atest)?)+)\s?-\s?((?:\d|l(?:atest)?)+)/);
			if(match[1] === "l" || match[1] === "latest") match[1] = casecount;
			else match[1] = parseInt(match[1]);
			if(match[2] === "l" || match[1] === "latest") match[2] = casecount;
			else match[2] = parseInt(match[2]);

			if(match[2] < match[1]) return __("phrases.invalidRange", message);
			for(let i = match[1]; i <= match[2]; i++) cases.push(i);
		} else if(message.args[0].indexOf(",") !== -1) {
			message.args[0].split(",").forEach(part => cases.push(part));
		} else {
			cases.push(message.args[0]);
		}

		cases = cases.map(int => {
			if(int === "l" || int === "latest") return casecount;
			else return parseInt(int);
		});
		if(cases.some(int => isNaN(int))) return __("commands.moderator.reason.invalidInput", message);

		let errMsg, casesSet = 0;
		for(let caseNum of cases) {
			if(errMsg) break;
			let resp = await modLog.set(message.channel.guild, caseNum, message.args[1], message.author);

			if(resp === "SUCCESS") casesSet++;
			else if(resp === "NO_DATA") errMsg = __("commands.moderator.reason.invalidCase", message, { caseNum });
			else if(resp === "NO_CHANNEL") errMsg = __("commands.moderator.reason.noChannel", message);
			else if(resp === "NO_MSG") errMsg = __("commands.moderator.reason.noMessage", message, { caseNum });
			else errMsg = resp;
		}

		let returnMsg = "";
		if(cases.length === 1 && !errMsg) {
			returnMsg = __("commands.moderator.reason.successOneCase", message, { caseNum: cases[0] });
		} else if(casesSet) {
			returnMsg = __("commands.moderator.reason.successMultipleCases", message, { casesCount: cases.length });
		}
		if(errMsg) returnMsg += errMsg;
		return returnMsg;
	},
	caseSensitive: true,
	guildOnly: true,
	perm: "kickMembers",
	description: "Set a reason of a case (or multiple) on the mod log",
	args: [{
		type: "text",
		label: "cases"
	}, {
		type: "text",
		label: "reason"
	}]
};
