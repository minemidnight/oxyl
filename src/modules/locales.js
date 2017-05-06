const locales = {};
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");

async function loadLocales() {
	for(let locale of bot.locales) {
		let strings = await fs.readFileAsync(path.resolve("locales", `${locale}.json`));
		locales[locale] = JSON.parse(strings);
	}
}

global.__ = (context, message = { locale: "en" }, values = {}) => {
	let string = locales[message.locale];
	for(let part of context.split(".")) {
		if(!string[part]) {
			return `Invalid context for translation: ${context}, ${part}. Please report this to Support`;
		}

		string = string[part];
	}

	let placeholders = string.match(/{{[^{}]+}}/g);
	placeholders.forEach(placeholder => {
		placeholder = placeholder.substring(2, placeholder.length - 2);
		string = string.replace(new RegExp(`{{${placeholder}}}`, "gi"), values[placeholder] || "**INVALID PLACEHOLDER**");
	});

	return string;
};

module.exports = { loadLocales, __ };
loadLocales();
