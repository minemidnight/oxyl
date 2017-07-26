module.exports = {
	name: "Icon of a server",
	description: "The icon url of a server",
	examples: [`set {_icon} to icon of server from event-message`],
	patterns: [`[the] icon[s] [(link|url)][s] of %servers%`, `%servers%['[s]] icon[s] [(link|url)][s]`],
	run: async (options, server) => server.iconURL
};
