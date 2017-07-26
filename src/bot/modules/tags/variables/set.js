module.exports = {
	name: "Set Variable",
	description: "Set a variable",
	examples: [`set {_a} to true`],
	patterns: [`set [the] [variable] {%text%} to %anys%`],
	giveFullLists: true,
	run: (options, name, any) => {
		if(!name.match(/^_?[A-Za-z0-9\-:\.]+\*?$/)) {
			throw new options.TagError(`Invalid variable name: ${name}. ` +
				`Variables can only contain letters, numbers, colons, periods, and hypens`);
		} else {
			let local = false;
			let variable = options.variables.get() || {};

			if(name.startsWith("_")) {
				local = true;
				name = name.substring(1);
			}

			let parts = name.split(/(:{2})/g), piece, prevPath, reference = variable;
			for(let part of parts) {
				if(!piece) {
					if(!variable[part]) variable[part] = {};
					prevPath = part;

					piece = "next";
				} else if(piece === "::") {
					if(!reference[prevPath][part]) reference[prevPath][part] = [];
					reference = reference[prevPath];
					prevPath = part;

					piece = "next";
				} else {
					piece = part;
				}
			}

			let lastElement = parts[parts.length - 1];
			if(lastElement === "*") reference = any;
			else reference[lastElement] = any;

			if(variable.local) options.variables.set(`_${name}`, variable);
			else options.variables.set(name, variable);

			return options.run("next");
		}
	}
}
;
