module.exports = {
	name: "Get Variable",
	description: "Get a variable",
	examples: [`{_a}`],
	patterns: [`[the] [variable] {%text%}`],
	giveFullLists: true,
	run: (options, name) => {
		if(!name.match(/^_?[A-Za-z0-9\-:\.\s]+\*?$/)) {
			throw new options.TagError(`Invalid variable name: {${name}}. ` +
				`Variables can only contain letters, numbers, colons, periods, spaces, and hypens`);
		} else if(~name.indexOf("::")) {
			let otherVars = name.match(/(_?[A-Za-z0-9\-\.\s]+)::/g);
			if(!otherVars) throw new options.TagError(`Invalid list variable: {${name}}`);

			otherVars = otherVars.map(vName => vName.substring(0, vName.length - 2));
			let reference;
			otherVars.forEach((vName, i) => {
				if(!reference) {
					reference = options.data.variables.set(vName, []).get(vName);
				} else {
					if(!reference[vName]) reference[vName] = [];
					reference = reference[vName];
				}
			});

			let index = name.substring(name.lastIndexOf("::") + 2);
			if(index === "*") return reference;
			else return reference[index];
		} else {
			return options.data.variables.get(name);
		}
	}
};
