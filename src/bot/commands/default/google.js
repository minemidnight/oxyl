const cheerio = require("cheerio");
const superagent = require("superagent");

module.exports = {
	process: async message => {
		let { text: body } = await superagent
			.get(`https://www.google.com/search?q=${encodeURIComponent(message.args[0])}&hl=en`);
		let $ = cheerio.load(body); // eslint-disable-line id-length

		let resultmsg = "";
		let results = $(".g .r a");
		if(!results.get().length) return __("commands.default.google.noResults", message);

		let dictionary = $(".g").eq(0).find("div");
		if(dictionary.get().length) {
			resultmsg += `\n\n**${__("phrases.dictionary", message)}**`;

			let [word, pronunciation] = dictionary.find(".r").eq(0).find("div span")
				.map((index, element) => $(element).text()).get();

			let tableData = dictionary.find("table tbody").eq(0).find("tr td");
			let partOfSpeech = tableData.find("div").text();
			resultmsg += `\n${word} (${pronunciation})\n_${partOfSpeech}`;

			let definitions = tableData.find("ol li");
			for(let i = 0; i < definitions.get().length; i++) {
				let definition = definitions.eq(i).text();
				resultmsg += `\n\n**${i}**.  ${definition}`;
			}
		}

		let translate = $(".g div table.ts tbody tr td h3.r");
		if(translate.get().length) {
			resultmsg += `\n\n**${__("phrases.translation", message)}**`;

			let [input, output] = translate.find("span").map((index, element) => $(element).text()).get();
			resultmsg += `\n${input} => ${output}`;
		}

		let calculator = $("#topstuff ._tLi tbody tr td").eq(3).find("span.nobr h2.r");
		if(calculator.get().length) resultmsg += `\n\n**${__("phrases.calculator", message)}**\n${calculator.text()}`;

		let infoCard = $("#rhs_block ol .g");
		if(infoCard.get().length) {
			let title = infoCard.find("._o0d div ._B5d").text();
			let info = infoCard.find("._o0d div ._zdb._Pxg").text();
			let description = infoCard.find("._o0d ._tXc span").clone().children().remove().end().text();

			resultmsg += `\n${title} (${info})\n${description}`;
		}

		let stories = $(".g div table.ts tbody td").eq(1).find("div");
		if(stories.get().length) {
			for(let i = 0; i < stories.get().length; i++) {
				let ele = stories.eq(i).find("a");
				let link = ele.attr("href");
				let storyName = ele.text();

				if(~link.indexOf("/url?q=")) link = link.substring(link.indexOf("/url?q=") + 7, link.indexOf("&sa="));
				if(i) link = `<${link}>`;
				resultmsg += `\n${storyName}\n_${link}`;
			}
		}

		resultmsg += `\n\n**${__("phrases.searchResults", message)}**`;
		for(let i = 0; i < 3; i++) {
			let ele = results.eq(i);

			let link = ele.attr("href");
			if(!link) continue;
			else if(~link.indexOf("/url?q=")) link = link.substring(link.indexOf("/url?q=") + 7, link.indexOf("&sa="));


			if(i) link = `<${link}>`;
			resultmsg += `\n${link}`;
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
