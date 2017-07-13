const cheerio = require("cheerio");
const superagent = require("superagent");

module.exports = {
	process: async message => {
		let { text: body } = await superagent.(`https://www.google.com/search?q=${encodeURI(message.args[0])}`);
		let $ = cheerio.load(body); // eslint-disable-line id-length
		let results = $(".r"), resultmsg = "";

		if(results.length === 0) return __("commands.default.google.noResults", message);
		for(let i = 0; i < 3; i++) {
			let ele = results.eq(i);

			let link = ele.find("a").attr("href");
			if(!link) continue;
			if(link.indexOf("/url?q=") !== -1) {
				link = link.replace("/url?q=", "");
				link = link.slice(0, link.indexOf("&sa"));
			}
			if(i === 0) resultmsg += link;
			else if(i === 1) resultmsg += `\n\n**${__("phrases.otherResults", message)}**\n<${link}>`;
			else resultmsg += `\n<${link}>`;
		}
		return resultmsg;
	},
	description: "Search google for a query",
	aliases: ["g"],
	args: [{
		type: "text",
		label: "query"
	}]
};
