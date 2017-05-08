const locales = {};
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");

async function loadLocales() {
	for(let locale of bot.locales) {
		let strings = await fs.readFileAsync(path.resolve("locales", `${locale}.json`));
		locales[locale] = JSON.parse(strings);
	}
}

global.__ = (context, message = { locale: "en" }, values = {}, capitializeFirst = false) => {
	if(message.ownerID) message.locale = bot.localeCache.get(message.id) || "en";
	let string = locales[message.locale];
	for(let part of context.split(".")) {
		if(!string[part]) return __("modules.locales.invalidContext", message, { context, part });
		else string = string[part];
	}

	if(typeof string !== string) return __("modules.locales.incompleteContext", message, { context });

	let placeholders = string.match(/{{[^{}]+}}/g);
	if(placeholders) {
		placeholders.forEach(placeholder => {
			placeholder = placeholder.substring(2, placeholder.length - 2);
			string = string.replace(`{{${placeholder}}}`,
				values[placeholder] || __("modules.locales.invalidPlaceholder", message));
		});
	}

	if(capitializeFirst) return string.charAt(0).toUpperCase() + string.substring(1);
	else return string;
};

module.exports = { loadLocales, __ };
loadLocales();
