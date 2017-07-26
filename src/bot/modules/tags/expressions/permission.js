let perms = require("eris").Constants.Permissions;
let reversePerms = Object.keys(perms).reduce((prev, next) => {
	prev[perms[next]] = next;
	return prev;
}, {});

module.exports = {
	name: "Permission",
	description: "Return a string of a permission name",
	examples: [`perm to ban members`],
	patterns: [`[the] perm[ission] [to] [create] invite[s]`,
		`[the] perm[ission] [to] kick [member[s]]`,
		`[the] perm[ission] [to] ban [member[s]]`,
		`administrator perm[ission]`,
		`[the] perm[ission] [to] manage channel[s]`,
		`[the] perm[ission] [to] manage (server|guild)`,
		`[the] perm[ission] [to] add reaction[s]`,
		`[the] perm[ission] [to] view audit log[s]`,
		`[the] perm[ission] [to] read message[s]`,
		`[the] perm[ission] [to] send message[s]`,
		`[the] perm[ission] [to] send (text to speech|tts) message[s]`,
		`[the] perm[ission] [to] (manage|delete) message[s]`,
		`[the] perm[ission] [to] embed [(links|urls)]`,
		`[the] perm[ission] [to] (attach|upload) (file|image)[s]`,
		`[the] perm[ission] [to] read message[s] history`,
		`[the] perm[ission] [to] mention (everyone|here)`,
		`[the] perm[ission] [to] [use] external (emoji|emote)[s]`,
		`[the] perm[ission] [to] connect to voice [channel[s]]`,
		`[the] perm[ission] [to] speak in voice [channel[s]]`,
		`[the] perm[ission] [to] mute [(voice|other)] members`,
		`[the] perm[ission] [to] deafen [(voice|other)] members`,
		`[the] perm[ission] [to] move [(voice|other)] members`,
		`[the] perm[ission] [to] [(use|for)] (voice activity|vad)`,
		`[the] perm[ission] [to] change [self] nickname`,
		`[the] perm[ission] [to] (manage|edit) [other['][s]] nickname[s]`,
		`[the] perm[ission] [to] (manage|edit|change) [other['][s]] role[s]`,
		`[the] perm[ission] [to] (manage|edit|change) webhook[s]`,
		`all text perm[ission][s]`,
		`all voice perm[ission][s]`,
		`[the] perm[ission] [to] (manage|edit|change) (emoji|emote)[s]`,
		`all (server|guild) perm[ission][s]`,
		`all perm[ission][s]`],
	returns: "permission",
	run: async (options, text) => reversePerms[1 >> options.matchIndex]
};
