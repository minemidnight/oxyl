const flags = { en: "🇺🇸" };

function localeFormat(locale) {
	let format = `${flags[locale]} ` || "";
	format += locale;
	format += __("commands.default.locale.nativeName", { locale });
	if(locale !== "en") format += __("commands.default.locale.englishName", { locale });
}

module.exports = {
	process: async message => {
		if(!message.args[0]) {
			return __("commands.default.locale.noArg", message, {
				locales: bot.locales.map(localeFormat).join("\n"),
				locale: localeFormat(message.locale)
			});
		} else if(!~bot.locales.indexOf(message.args[0])) {
			return __("commands.default.locale.invalidLocale", message);
		} else {
			await r.table("locales").insert({ id: message.author.id, locale: message.args[0] }).run();
			bot.localeCache.set(message.author.id, message.args[0]);
			message.locale = message.args[0];

			let name = __("commands.default.locale.nativeName", message);
			return __("commands.default.locale.changedSuccess", message, { locale: `${message.args[0]} (${name})` });
		}
	},
	description: "Set your language",
	aliases: ["lang"],
	args: [{
		type: "text",
		label: "language"
	}]
};
