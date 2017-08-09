module.exports = {
	name: "Set Variable",
	description: "Set a variable",
	examples: [`set {_a} to true`],
	patterns: [`set(?: the)?(?: variable)? {(.+?)} to (.+)`],
	dontProcess: [0],
	giveFullLists: true,
	giveRaw: true,
	run: (options, name, any) => {
		if(!name.match(/^_?[A-Za-z0-9\-:\.\s]+\*?$/)) {
			throw new options.TagError(`Invalid variable name: {${name}}. ` +
				`Variables can only contain letters, numbers, colons, periods, spaces, and hypens`);
		} else if(~name.indexOf("::")) {
			let otherVars = name.match(/(_?[A-Za-z0-9\-\.\s]+)::/g);
			if(!otherVars) throw new options.TagError(`Invalid list variable: {${name}}`);

			otherVars = otherVars.map(vName => vName.substring(0, vName.length - 2));
			let reference, prev, prevName;
			otherVars.forEach((vName, i) => {
				if(!reference) {
					prev = options.variables.set(vName, []);
					prevName = vName;

					reference = prev.get(vName);
				} else {
					prev = reference;
					prevName = vName;

					if(!reference[vName]) reference[vName] = [];
					reference = reference[vName];
				}
			});

			let index = name.substring(name.lastIndexOf("::") + 2);
			if(index === "*") prev[prevName] = any;
			else reference[index] = any;
		} else {
			options.variables.set(name, any);
		}
	}
};
