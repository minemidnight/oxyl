const { updateEntry } = require("../../modules/modLog");

module.exports = {
	async run({	args: [cases, reason], author, guild, t, wiggle: { locals: { r } }, wiggle }) {
		const caseCount = await r.table("modLog")
			.getAll(guild.id, { index: "guildID" })
			.count()
			.run();
		if(!caseCount) return t("commands.reason.noCases");

		const caseList = [];
		for(let casePart of cases.split(",")) {
			if(~casePart.indexOf("-")) {
				let [, start, end] = cases.match(/(\d+)\s?-\s?(\d+|l(?:atest)?)/) || [0, 0, 0];
				if(!start || !end) return t("commands.reason.invalidRange");

				if(~["l", "latest"].indexOf(end)) end = caseCount;
				start = parseInt(start);
				end = parseInt(end);
				if(isNaN(start) || isNaN(end)) return t("commands.reason.NaN");
				else if(end >= start) return t("commands.reason.invalidRange");
				caseList.push(...Array.from({ length: end - start + 1 }, (ele, i) => i + start));
			} else {
				if(~["l", "latest"].indexOf(casePart)) casePart = caseCount;
				casePart = parseInt(casePart);

				if(isNaN(casePart)) return t("commands.reason.NaN");
				else caseList.push(casePart);
			}
		}

		let casesUpdated = 0, errorMessage;
		for(const caseID of caseList) {
			if(errorMessage) break;
			const update = await updateEntry(caseID, {
				guild,
				responsible: author,
				reason
			}, wiggle);

			if(update === "NO_CASE") errorMessage = t("commands.reason.invalidCase", { case: caseID });
			else if(update === "NO_CHANNEL") errorMessage = t("commands.reason.noChannel");
			else if(update === "NO_MESSAGE") errorMessage = t("commands.reason.noMessage", { case: caseID });
			casesUpdated++;
		}

		let returnMessage;
		if(cases.length === 1 && !errorMessage) returnMessage = t("commands.reason.updatedOne", { case: caseList[0] });
		else if(casesUpdated) returnMessage = t("commands.reason.updatedMultiple", { caseCount: casesUpdated });

		if(errorMessage) returnMessage += errorMessage;
		return returnMessage;
	},
	caseSensitive: true,
	guildOnly: true,
	perm: "kickMembers",
	args: [{
		type: "text",
		label: "cases"
	}, {
		type: "text",
		label: "reason"
	}]
};
