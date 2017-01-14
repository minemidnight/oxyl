const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js"),
	handlebars = require("handlebars");
const router = express.Router(); // eslint-disable-line new-cap

const tagReq = Oxyl.cmdScripts.tags;
router.get("/", async (req, res) => {
	let data = { tags: [] };
	for(let i of tagReq.sorted) {
		let tag = tagReq.info[i];
		let input = `${tag.in ? tag.in.startsWith("@%") ? tag.in.substring(2) : `{${i}:${tag.in}}` : `{${i}}`}`;
		data.tags.push({
			name: i,
			usage: tag.usage ? tag.usage.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "[ ]",
			return: tag.return,
			input: input,
			out: tag.out
		});
	}

	res.send(await main.parseHB("tags", req, data));
});

handlebars.registerHelper("listtags", (tags) => {
	let returnstr = "";
	for(let tag in tags) {
		tag = tags[tag];
		returnstr += `<tr class="w3-hover-notquiteblack">`;
		returnstr += `<td>${tag.name}</td>`;
		returnstr += `<td>${tag.usage}</td>`;
		returnstr += `<td>${tag.return}</td>`;
		returnstr += `<td>${tag.input}</td>`;
		returnstr += `<td>${tag.out}</td>`;
		returnstr += `</tr>`;
	}

	return new handlebars.SafeString(returnstr);
});

module.exports = router;
