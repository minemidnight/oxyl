const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js"),
	handlebars = require("handlebars");
const router = express.Router(); // eslint-disable-line new-cap

const tagReq = Oxyl.cmdScripts.tags;
router.get("/", (req, res) => {
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

	main.parseHB("editor", req, data)
	.then(hbs => res.send(hbs));
});

module.exports = router;
