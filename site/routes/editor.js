const express = require("express"),
	main = require("../website.js"),
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

	res.send(await main.parseHB("editor", req, data));
	res.end();
});

module.exports = router;
