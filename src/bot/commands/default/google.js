const cheerio = require("cheerio");
const superagent = require("superagent");

module.exports = {
	process: async message => {
		let { text: body } = await superagent.get(`https://www.google.com/search?q=${encodeURI(message.args[0])}`);
		let $ = cheerio.load(body); // eslint-disable-line id-length

		let resultmsg;
		let results = $("h3.r a");
		if(!results.get().length) return __("commands.default.google.noResults", message);

		let dictionary = $("div.lr_dct_ent.vmod");
		if(dictionary.get().length) {
			resultmsg += `\n\n**${__("phrases.dictionary", message)}**`;

			let word = dictionary.find(".vk_ans span").text();
			let pronunciation = dictionary.find(".vmod .lr_dct_ent_ph .lr_dct_ph span").text();
			let partOfSpeech = dictionary.find(".vmod .vmod lr_dct_sf_h i span").text();
			resultmsg += `\n${word} (${pronunciation})\n_${partOfSpeech}`;

			let definitions = dictionary.find(".vmod .vmod ol.lr_dct_sf_sens li");
			for(let i = 0; i < definitions.get().length(); i++) {
				let ele = definitions.eq(i).find(".vmod ._Jig").parent();
				let [definition, example] = ele.find("span").map((i, element) => $(element).text()).get();

				resultmsg += `\n\n**${i}**.  ${definition}\n${example}`;
			}
		}

		let translate = $("#tw-ob");
		if(translate.get().length()) {
			resultmsg += `\n\n**${__("phrases.translation", message)}**`;

			let fromLang = translate.find("#tw-sl :selected").text();
			let toLang = translate.find("#tw-tl :selected").text();
			let input = translate.find("#tw-source-text-ta").val();
			let output = translate.find("#tw-target-text span").text();
			resultmsg += `\n${fromLang} => ${toLang}\n${input} => ${output}`;
		}

		let calculator = $("#cwmcwd");
		if(calculator.get().length()) {
			resultmsg += `\n\n**${__("phrases.calculator", message)}**`;

			let calculation = calculator.find("#cwles").text().trim();
			let result = calculator.find("#cwos").text();
			resultmsg += `\n${calculation} ${result}`;
		}

		let infoCard = $("#rhs_block").find("div.xpdopen div._OKe div").eq(1);
		if(infoCard.get().length) {
			let title = infoCard.find(".kp-header ._cFb ._fdf .kno-fb-ctx.kno-erc-pt span").text();
			let info = infoCard.find(".kp-header ._cFb ._fdf .kno-fb-ctx._gdf span").text();
			let website = infoCard.find(".mod ._ilf ._glf.ellip").attr("href");
			let description = infoCard.find(".kno-rdesc span").eq(0).text();

			if(website) resultmsg += `\n${title} (${info}) - <${website}>`;
			else resultmsg += `\n${title} (${info})`;
			resultmsg += `\n${description}`;
		}

		let stories = $("._0cr").find("div");
		if(stories.get().length) {
			for(let i = 0; i < stories.get().length(); i++) {
				let ele = stories.eq(i).find("g-inner-card a");
				let link = ele.attr("href");
				let storyName = ele.find("div._Jvo div").text();

				if(!i) link = `<${link}>`;
				resultmsg += `\n${storyName}\n_${link}`;
			}
		}

		resultmsg += `\n\n**${__("phrases.searchResults", message)}**`;
		for(let i = 0; i < 3; i++) {
			let ele = results.eq(i);

			let link = ele.attr("href");
			if(!link) continue;

			if(i === 0) resultmsg += link;
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
