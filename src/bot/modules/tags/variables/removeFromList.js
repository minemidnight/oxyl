module.exports = {
	name: "Remove from Variable",
	description: "Remove froo a variable. If this is a list, it remove the last element and shift all indexes past it",
	examples: [`set {_int} to 4\nremove 1 from {_int}`,
		`set {_names::*} to "Bob", "Joe" and "Bill"\nremove "Joe" to {_names::*}`],
	patterns: [`remove %anys% from [the] [variable] {%text%}`],
	run: (options, name, any) => {
		if(!name.match(/^_?[A-Za-z0-9\-:\.\s]+\*?$/)) {
			throw new options.TagError(`Invalid variable name: {${name}}. ` +
				`Variables can only contain letters, numbers, colons, periods, spaces, and hypens`);
		} else {
			if(~name.indexOf("::")) {
				let otherVars = name.match(/(_?[A-Za-z0-9\-\.\s]+)::/g);
				if(!otherVars || !name.endsWith("*")) throw new options.TagError(`Invalid list variable: {${name}}`);

				otherVars = otherVars.map(vName => vName.substring(0, vName.length - 2));
				let reference, prev, prevName;
				otherVars.forEach((vName, i) => {
					if(!reference) {
						prev = options.data.variables.set(vName, []);
						prevName = vName;

						reference = prev.get(vName);
					} else {
						prev = reference;
						prevName = vName;

						if(!reference[vName]) reference[vName] = [];
						reference = reference[vName];
					}
				});

				if(~prev[prevName].indexOf(any)) prev[prevName].splice(prev[prevName].indexOf(any), 1);
			} else {
				let value = options.data.variables.get(name);
				if(!value) throw new options.TagError(`Variable {${name}} is not defined`);
				options.data.variables.set(name, value - any);
			}

			return options.data;
		}
	}
};
