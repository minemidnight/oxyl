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
		if(!string[part]) {
			return `Invalid context for translation: ${context}, ${part} (non existant). Please report this to Support`;
		}

		string = string[part];
	}

	if(typeof string !== string) {
		return `Invalid context for translation: ${context} (non string). Please report this to Support`;
	}

	let placeholders = string.match(/{{[^{}]+}}/g);
	if(placeholders) {
		placeholders.forEach(placeholder => {
			placeholder = placeholder.substring(2, placeholder.length - 2);
			string = string.replace(new RegExp(`{{${placeholder}}}`, "g"), values[placeholder] || "**INVALID PLACEHOLDER**");
		});
	}

	if(capitializeFirst) string = string.charAt(0).toUpperCase + string.substring(1);
	return string;
};

module.exports = { loadLocales, __ };
loadLocales();
