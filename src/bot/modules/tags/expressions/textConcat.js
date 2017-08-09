module.exports = {
	name: "Concatinate to text",
	description: "Add something to a text",
	examples: [`set {_text} to "hello" + name of author from event-message`],
	patterns: [`%text%[ ]\\+[ ]%any%`, `%any%[ ]\\+[ ]%text%`, `%text% added to %any%`, `%any% added to %text%`],
	returns: "text",
	run: async (options, text1, text2) => text1.toString() + text2.toString()
};
