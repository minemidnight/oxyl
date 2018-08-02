const { toAST } = require("ohm-js/extras");
const processedReturnValue = Symbol("processedReturnValue");

const CheckResult = require("./CheckResult");
const returnTypes = require("./returnTypes");
const transformations = require("./transformations");
const typechecks = require("./typechecks");

function checkTypes(value, options, data) {
	if(value.type === "variable") value = { type: { type: "variable", name: value.name } }; // hacky


	for(let [key, expectedType] of Object.entries(options)) { // eslint-disable-line prefer-const
		if(expectedType === "number") expectedType = ["float", "integer"];
		else if(!Array.isArray(expectedType)) expectedType = [expectedType];

		if(value[key].type === "variable") {
			const variableName = value[key].name;
			value[key] = data.variables[variableName];

			if(value[key] === undefined) {
				data.checkResult.addError(`{${variableName}} has not been defined`,
					value.startIndex,
					value.endIndex);

				return;
			} else if(value[key].type && typechecks[value[key].type]) {
				checkTypes(value[key], typechecks[value[key].type], data);
				continue;
			}
		}

		const actualType = value[key].type || value[key];
		if(expectedType.includes("string")) {
			continue;
		} else if(actualType === "number" && (expectedType.indexOf("float") || ~expectedType.includes("integer"))) {
			continue;
		} else if(!expectedType.includes(actualType)) {
			data.checkResult.addError(`Expected type ${expectedType.join(" or ")} for ${key} in ${value.type}, ` +
				`instead got ${actualType}`, value.startIndex, value.endIndex);

			return;
		}
	}
}

function checkASTTree(ast, data) {
	Object.entries(ast).forEach(([key, value]) => {
		if(Array.isArray(value)) {
			value.forEach(astTree => checkASTTree(astTree, data));
			return;
		}

		if(key === "type" && value === "VariableStatement") data.variables[ast.name] = ast.value;
		if(value && typeof value === "object") {
			const type = value.type;
			const typeNoUnderscore = type.split("_")[0];

			if(!ast[key][processedReturnValue] && returnTypes[typeNoUnderscore]) {
				Object.assign(ast, {
					[processedReturnValue]: true,
					type: returnTypes[typeNoUnderscore]
				});
			}

			checkASTTree(value, data);
		}
	});

	if(ast.type && typechecks[ast.type]) checkTypes(ast, typechecks[ast.type], data);
}

module.exports = match => {
	const ast = toAST(match, transformations);

	const checkResult = new CheckResult();
	checkASTTree(ast, {
		checkResult,
		variables: {}
	});

	return checkResult;
};
