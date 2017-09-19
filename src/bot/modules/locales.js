const locales = {};
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");

async function loadLocales() {
	for(let locale of bot.locales) {
		let strings = await fs.readFileAsync(path.resolve("locales", `${locale}.json`));
		locales[locale] = JSON.parse(strings);
	}
}

const __ = global.__ = (context, object = { locale: "en" }, values = {}, capitializeFirst = false) => {
	if(object.ownerID) object.locale = bot.localeCache.get(object.id) || "en";
	let string = locales[object.locale];
	for(let part of context.split(".")) {
		if(!string[part] && object.locale !== "en") return __(context, undefined, values, capitializeFirst);
		else if(!string[part]) return __("modules.locales.invalidContext", object, { context, part });
		else string = string[part];
	}

	if(typeof string !== "string") return __("modules.locales.incompleteContext", object, { context });

	let placeholders = string.match(/{{[^{}]+}}/g);
	if(placeholders) {
		placeholders.forEach(placeholder => {
			placeholder = placeholder.substring(2, placeholder.length - 2);
			string = string.replace(`{{${placeholder}}}`,
				values[placeholder] === undefined ? __("modules.locales.invalidPlaceholder", object) : values[placeholder]);
		});
	}

	if(capitializeFirst) return string.charAt(0).toUpperCase() + string.substring(1);
	else return string;
};

module.exports = { loadLocales, __ };
loadLocales();
