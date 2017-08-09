module.exports = {
	name: "Add to Variable",
	description: "Add to a variable. If this is a list, it will add it as the last element",
	examples: [`set {_int} to 4\nadd 1 to {_int}`, `set {_names::*} to "Bob" and "Bill"\nadd "Joe" to {_names::*}`],
	patterns: [`add (.+?) to(?: the)?(?: variable)? {(.+?)}`],
	dontProcess: [1],
	giveRaw: true,
	run: (options, name, any) => {
		if(!name.match(/^_?[A-Za-z0-9\-:\.\s]+\*?$/)) {
			throw new options.TagError(`Invalid variable name: {${name}}. ` +
				`Variables can only contain letters, numbers, colons, periods, spaces, and hypens`);
		} else if(~name.indexOf("::")) {
			let otherVars = name.match(/(_?[A-Za-z0-9\-\.\s]+)::/g);
			if(!otherVars || !name.endsWith("*")) throw new options.TagError(`Invalid list variable: {${name}}`);

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

			prev[prevName].push(any);
		} else {
			let value = options.variables.get(name);
			if(!value) throw new options.TagError(`Variable {${name}} is not defined`);
			options.variables.set(name, value + any);
		}
	}
};
