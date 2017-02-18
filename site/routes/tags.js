const express = require("express"),
	main = require("../website.js"),
	handlebars = require("handlebars");
const router = express.Router(); // eslint-disable-line new-cap

const tags = Oxyl.modScripts.tagModule;
router.get("/", async (req, res) => {
	let data = { tags: [] };
	for(let i of tags.sorted) {
		let tag = tags.info[i];
		let input = `${tag.in ? tag.in.startsWith("@%") ? tag.in.substring(2) : `{${i}:${tag.in}}` : `{${i}}`}`;
		data.tags.push({
			name: i,
			usage: tag.usage ? main.escapeHTML(tag.usage) : "[ ]",
			return: tag.return,
			input: input,
			out: tag.out
		});
	}

	res.send(await main.parseHB("tags", req, data));
	res.end();
});

handlebars.registerHelper("listtags", taglist => {
	let returnstr = "";
	for(let tag in taglist) {
		tag = taglist[tag];
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
