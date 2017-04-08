const modLog = require("../../modules/modLog.js");
module.exports = {
	process: async message => {
		let cases = [], casecount = (await modLog.cases(message.channel.guild)).length;
		if(casecount.length === 0) return "There have been no cases for this guild yet.";

		if(message.args[0].indexOf("-") !== -1) {
			let match = message.args[0].match(/((?:\d|l)+)\s?-\s?((?:\d|l)+)/);
			match[1] = match[1] === "l" ? casecount : parseInt(match[1]);
			match[2] = match[2] === "l" ? casecount : parseInt(match[2]);
			if(match[2] < match[1]) return "Invalid range given!";
			for(let i = match[1]; i < match[2]; i++) cases.push(i);
		} else if(message.args[0].indexOf(",") !== -1) {
			message.args[0].split(",").forEach(cases.push);
		} else {
			cases.push(message.args[0]);
		}

		cases = cases.map(int => {
			if(int === "l" || int === "latest") return casecount;
			else return parseInt(int);
		});
		if(cases.some(int => isNaN(int))) return "Please only provide numbers for cases";

		let errMsg, casesSet = 0;
		for(let caseNum of cases) {
			if(errMsg) break;
			let resp = await modLog.set(message.channel.guild, caseNum, message.args[1], message.author);

			if(resp === "SUCCESS") casesSet++;
			else if(resp === "NO_DATA") errMsg = `Case \`${caseNum}\` not found`;
			else if(resp === "NO_CHANNEL") errMsg = `The mod log channel is not set`;
			else if(resp === "NO_MSG") errMsg = `Message from case \`${caseNum}\` not found`;
			else errMsg = `Unexpected error`;
		}

		let returnMsg = "";
		if(cases.length === 1 && !errMsg) {
			returnMsg = `:white_check_mark: Set reason for case \`${cases[0]}\``;
		} else if(casesSet) {
			returnMsg = `:white_check_mark: Set reason for ${casesSet} cases`;
		}
		if(errMsg) returnMsg += errMsg;
		return returnMsg;
	},
	caseSensitive: true,
	guildOnly: true,
	perm: "banMembers",
	description: "Set a reason of a case (or multiple) on the mod log",
	args: [{
		type: "text",
		label: "cases"
	}, {
		type: "text",
		label: "reason"
	}]
};
