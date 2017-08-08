module.exports = {
	name: "Substring",
	description: "Extracts parts of a text",
	examples: [`set {_test} to substring of "abc" from chars 1 to 3`],
	patterns: [`[the] (part|sub[ ](text|string)) of %texts% (between|from) (ind(ex|ices)|char[acter][s])` +
		`%integer% [(and|to) (index|char[acter])] %integer%`,
	`[the] first [%integer%] character[s] of %texts%`,
	`[the] last [%integer%] character[s] of %texts%`,
	`[the] %integer% first characters of %texts%`,
	`[the] %integer% last characters of %texts%`],
	returns: "text",
	run: async (options, type1, type2, type3) => {
		if(options.matchIndex === 0) {
			return type1.substring(type2 - 1, type3);
		} else if(options.matchIndex === 1) {
			return type2.substring(0, type1 || 1);
		} else if(options.matchIndex === 2) {
			return type2.substring(type2.length - (type1 || 1));
		} else if(options.matchIndex === 3) {
			return type2.substring(0, type1);
		} else {
			return type2.substring(type2.length - type1);
		}
	}
};
