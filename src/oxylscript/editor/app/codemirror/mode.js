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

export default {
	start: [
		{ regex: /"(?:\\"|.)+?"/, token: "string" },
		{ regex: /'(?:\\'|.)+?'/, token: "string" },
		{ regex: /\/\/.*/, token: "comment" },
		{ regex: /\/\*/, token: "comment", next: "comment" },
		{ regex: /abs(olute)?(\s+value)?\s+of\s+/, token: tokens.expression },
		{ regex: /clean\s+content\s+of/, token: tokens.expression },
		{ regex: /'s\s+clean\s+content/, token: tokens.expression },
		{ regex: /creation\s+timestamp\s+of/, token: tokens.expression },
		{ regex: /'s\s+creation\s+timestamp/, token: tokens.expression },
		{ regex: /difference\s+between/, token: tokens.expression },
		{ regex: /formatted\s+as\s+date/, token: tokens.expression },
		{ regex: /id\s+of/, token: tokens.expression },
		{ regex: /'s\s+id/, token: tokens.expression },
		{ regex: /index\s+of/, token: tokens.expression },
		{ regex: /member\s+count\s+of/, token: tokens.expression },
		{ regex: /'s\s+member\s+count/, token: tokens.expression },
		{ regex: /game\s+of/, token: tokens.expression },
		{ regex: /'s\s+game/, token: tokens.expression },
		{ regex: /join\s+timestamp\s+of/, token: tokens.expression },
		{ regex: /'s\s+join\s+timestamp/, token: tokens.expression },
		{ regex: /status\s+of/, token: tokens.expression },
		{ regex: /'s\s+status/, token: tokens.expression },
		{ regex: /mention\s+of/, token: tokens.expression },
		{ regex: /'s\s+mention/, token: tokens.expression },
		{ regex: /author\s+of/, token: tokens.expression },
		{ regex: /'s\s+author/, token: tokens.expression },
		{ regex: /content\s+of/, token: tokens.expression },
		{ regex: /'s\s+content/, token: tokens.expression },
		{ regex: /(user)?name\s+of/, token: tokens.expression },
		{ regex: /'s\s+(user)?name/, token: tokens.expression },
		{ regex: /random\s+number\s+between/, token: tokens.expression },
		{ regex: /inclusive/, token: tokens.expression },
		{ regex: /rounded(\s+(up|down))?/, token: tokens.expression },
		{ regex: /floor|ceil/, token: tokens.expression },
		{ regex: /icon\s+of/, token: tokens.expression },
		{ regex: /'s\s+icon/, token: tokens.expression },
		{ regex: /region\s+of/, token: tokens.expression },
		{ regex: /'s\s+region/, token: tokens.expression },
		{ regex: /owner\s+of/, token: tokens.expression },
		{ regex: /'s\s+owner/, token: tokens.expression },
		{ regex: /(the\s+)?(part|substring)\s+of\s+/, token: tokens.expression },
		{ regex: /(between|from)/, token: tokens.expression },
		{ regex: /(the\s+)?(first|last)/, token: tokens.expression },
		{ regex: /characters\s+of/, token: tokens.expression },
		{ regex: /added\s+to/, token: tokens.expression },
		{ regex: /length\s+of/, token: tokens.expression },
		{ regex: /'s\s+length/, token: tokens.expression },
		{ regex: /(lower|upper)case\s+of/, token: tokens.expression },
		{ regex: /avatar\s+of/, token: tokens.expression },
		{ regex: /'s\s+avatar/, token: tokens.expression },
		{ regex: /discriminator\s+of/, token: tokens.expression },
		{ regex: /'s\s+discriminator/, token: tokens.expression },
		{ regex: /tag\s+of/, token: tokens.expression },
		{ regex: /'s\s+tag/, token: tokens.expression },
		{ regex: /loop-?index/, token: tokens.expression },
		{ regex: /(the\s+)?(user|member|channel|role)\s+(from|with|of)\s+id\s+/, token: tokens.expression },
		{ regex: /(the\s+)?member\s+(from|of)\s+/, token: tokens.expression },
		{ regex: /(the\s+)?role\s+(from|with|of)\s+name\s+/, token: tokens.expression },
		{ regex: /has|contains|includes/, token: tokens.condition },
		{ regex: /(doesn'?t|does\s+not)\s+(contain|include)/, token: tokens.condition },
		{ regex: /exists|is\s+set/, token: tokens.condition },
		{ regex: /(doesn'?t|does\s+not)\s+exist/, token: tokens.condition },
		{ regex: /(isn'?t|is\s+not)\s+set/, token: tokens.condition },
		{ regex: /is|equals|is\s+equal\s+to|===?/, token: tokens.condition },
		{ regex: /(isn'?t|is\s+not)(\s+equal\s+to)?/, token: tokens.condition },
		{ regex: /(doesn'?t|does\s+not)\s+equal/, token: tokens.condition },
		{ regex: /!==?/, token: tokens.condition },
		{
			regex: /(is\s+)?(greater|more|higher|bigger|larger)\s+than(\s+or\s+(equal\s+to|equals))/,
			token: tokens.condition
		},
		{ regex: />=?/, token: tokens.condition },
		{ regex: /(is\s+)?(less|lower|smaller)\s+than(\s+or\s+((equal\s+to|equals)))/, token: tokens.condition },
		{ regex: /<=?/, token: tokens.condition },
		{ regex: /has(\s+the)?(\s+role)?/, token: tokens.condition },
		{ regex: /has(\s+the)?(\s+permission)?(\s+to)?/, token: tokens.condition },
		{ regex: /in/, token: tokens.condition },
		{
			regex: /(set\s+)(the\s+)?(variable\s+)?(\{)([a-zA-Z0-9])(\})(\s+to)/,
			token: [tokens.effect, tokens.effect, tokens.effect, "bracket", "variable", "bracket", tokens.effect]
		},
		{ regex: /is\s+a\s+bot/, token: tokens.condition },
		{ regex: /is\s+hoisted|displays\s+seperately/, token: tokens.condition },
		{ regex: /(add|remove)(\s+the)?(|s+role)?/, token: tokens.effect },
		{ regex: /ban(\s+the)?(\s+member)?/, token: tokens.effect },
		{ regex: /kick(\s+the)?(\s+member)?/, token: tokens.effect },
		{ regex: /(create|send)(\s+an?)?(\s+message)?(\s+(with\s+content|saying))?/, token: tokens.effect },
		{ regex: /send(\s+an?)?\s+(dm|direct\s+message)(\s+(with\s+content|saying))?/, token: tokens.effect },
		{ regex: /set(\s+the)?\s+nickname\s+of/, token: tokens.effect },
		{ regex: /to/, token: tokens.effect },
		{ regex: /(value\s+of\s+)?(\{)([a-zA-Z0-9])(\})/, token: ["keyword", "bracket", "variable", "bracket"] },
		{ regex: /\{/, indent: true, token: "bracket" },
		{ regex: /\}/, dedent: true, token: "bracket" },
		{ regex: /[\(\)]/, token: "bracket" },
		{ regex: /(loop)\s+(\d+)\s+(times)/, token: ["keyword", "number", "keyword"] },
		{ regex: /;/, token: "punctuation" },
		{ regex: /true|false/, token: "keyword" },
		{ regex: /\d*.\d+|\d+/, token: "number" },
		{ regex: /\+/, token: "positive" },
		{ regex: /-/, token: "negative" },
		{ regex: /\*|\/|\^/, token: "qualifier" },
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
		{ regex: /not|!|&&|\|\||or|and/, token: "strong" },
		{ regex: /\|/, token: tokens.expression }
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
