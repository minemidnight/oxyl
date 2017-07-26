module.exports = {
	name: "Formatted date",
	description: "A date (in milliseconds) converted to a human-readable date",
	examples: [`return "You joined this server on %formatted date of event-message's member join date%"`],
	patterns: [`[the] formatted (date|time[stamp])[s] (of|from) %numbers%`],
	run: async (options, date) => bot.utils.formatDate(date)
};
