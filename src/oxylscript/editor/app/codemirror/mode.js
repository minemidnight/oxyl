/*
	TOKENS:
	header
	quote
	positive
	negative
	strong
	em
	link
	strikethrough
	punctuation
	string-2
	meta
	hr
	invalidchar
	comment
	atom
	number
	property
	attribute
	keyword
	string
	variable
	variable-2
	variable-3
	def
	bracket
	tag
	number
	qualifier
	error
*/

const tokens = {
	effect: "def",
	expression: "atom",
	condition: "attribute"
};

module.exports = {
	start: [
		{ regex: /"(?:\\"|.)+?"/, token: "string" },
		{ regex: /'(?:\\'|.)+?'/, token: "string" },
		{ regex: /\/\/.*/, token: "comment" },
		{ regex: /\/\*/, token: "comment", next: "comment" },
		{
			regex: /(set\s+)(the\s+)?(variable\s+)?(\{)([a-zA-Z0-9])(\})(\s+to)/,
			token: [tokens.effect, tokens.effect, tokens.effect, "bracket", "variable", "bracket", tokens.effect]
		},
		{ regex: /add\s+(the\s+)?(role\s+)?/, token: tokens.effect },
		{ regex: /(value\s+of\s+)?(\{)([a-zA-Z0-9])(\})/, token: ["keyword", "bracket", "variable", "bracket"] },
		{ regex: /\{/, indent: true, token: "bracket" },
		{ regex: /\}/, dedent: true, token: "bracket" },
		{ regex: /[\(\)]/, token: "bracket" },
		{ regex: /(loop)\s+(\d+)\s+(times)/, token: ["keyword", "number", "keyword"] },
		{ regex: /;/, token: "punctuation" },
		{ regex: /true|false/, token: "keyword" },
		{ regex: /\d*.\d+|\d+/, token: "number" },
		{ regex: /+/, token: "positive" },
		{ regex: /-/, token: "negative" },
		{ regex: /create\s+an?\s+invite|create\s+invites/, token: "keyword" },
		{ regex: /kick\s+members/, token: "keyword" },
		{ regex: /ban\s+members/, token: "keyword" },
		{ regex: /admin(istrator)?/, token: "keyword" },
		{ regex: /manage\s+channels/, token: "keyword" },
		{ regex: /manage\s+guilds/, token: "keyword" },
		{ regex: /add\s+reactions/, token: "keyword" },
		{ regex: /view(\s+audit)?\s+logs/, token: "keyword" },
		{ regex: /read(\s+messages)?/, token: "keyword" },
		{ regex: /send(\s+messages)?/, token: "keyword" },
		{ regex: /send\s+tts(\s+messages)?/, token: "keyword" },
		{ regex: /send\s+text\s+to\s+speech(\s+messages)?/, token: "keyword" },
		{ regex: /(manage|delete)\s+messages/, token: "keyword" },
		{ regex: /(send|embed)\s+links/, token: "keyword" },
		{ regex: /(send|attach)\s+files/, token: "keyword" },
		{ regex: /read(\s+message)?\s+history/, token: "keyword" },
		{ regex: /(mention|use)\s+everyone/, token: "keyword" },
		{ regex: /(use\s+)?external\s+emo(jis|tes)/, token: "keyword" },
		{ regex: /(voice\s+)?connect/, token: "keyword" },
		{ regex: /connect\s+to\s+voice/, token: "keyword" },
		{ regex: /(voice\s+)?speak/, token: "keyword" },
		{ regex: /speak\s+in\s+voice/, token: "keyword" },
		{ regex: /(voice\s+)mute\s+members/, token: "keyword" },
		{ regex: /(voice\s+)deafen\s+members/, token: "keyword" },
		{ regex: /(voice\s+)move\s+members/, token: "keyword" },
		{ regex: /((voice\s+)?use\s+)?vad/i, token: "keyword" },
		{ regex: /change\s+nickname/, token: "keyword" },
		{ regex: /manage\s+nicknames/, token: "keyword" },
		{ regex: /manage\s+roles/, token: "keyword" },
		{ regex: /manage\s+webhooks/, token: "keyword" },
		{ regex: /manage\s+emojis/, token: "keyword" },
		{ regex: /(message\s+)?(author|sender)/, token: "keyword" },
		{ regex: /(sent\s+)?message/, token: "keyword" },
		{ regex: /channel(\s+from\s+message)?/, token: "keyword" },
		{ regex: /(guild|server)(\s+from\s+message)?/, token: "keyword" },
		{ regex: /if|else/, token: "keyword" },
		{ regex: /not|!|&&|\|\||or|and/, token: "strong" }
	],
	comment: [
		{ regex: /.*?\*\//, token: "comment", next: "start" },
		{ regex: /.*/, token: "comment" }
	],
	meta: {
		dontIndentStates: ["comment"],
		lineComment: "//"
	}
};
