const checkValue = (expected, key, body) => {
	const value = body[key];

	if(typeof value === "undefined" && !Array.isArray(expected)) {
		if(typeof expected === "string" && expected.endsWith("?")) return true;
		else return `Expected field "${key}" but none found`;
	}

	if(typeof expected === "string" && expected.endsWith("?")) expected = expected.slice(0, -1);

	if(expected === "string" && typeof value !== "string") {
		return `Expected field "${key}" to be a string, got ${typeof value}`;
	} else if(expected === "number" && typeof value !== "number") {
		return `Expected field "${key}" to be a number, got ${typeof value}`;
	} else if(expected === "boolean" && typeof value !== "boolean") {
		return `Expected field "${key}" to be a boolean, got ${typeof value}`;
	} else if((expected === "array" || Array.isArray(expected)) && !Array.isArray(value)) {
		return `Expected field "${key}" to be an array, got ${typeof value}`;
	} else if(expected === "object" && (typeof value !== "object" || Array.isArray(value))) {
		return `Expected field "${key}" to be an object, got ${typeof value}`;
	} else if(Array.isArray(expected) && !value.every(arrayValue => ~expected.indexOf(typeof arrayValue))) {
		return `Expected field "${key}" to be an array of ${expected.join(" or ")}`;
	} else if(typeof expected === "object" && !Array.isArray(expected)) {
		if(expected.hasOwnProperty("if")) {
			if(expected.hasOwnProperty("is")) {
				if(body[expected.if] && body[expected.if] !== expected.is) {
					return `Expected field "${key}" to exist only if ${expected.if} was ${expected.is}`;
				}
			} else if(expected.hasOwnProperty("in")) {
				if(!~expected.in.indexOf(body[expected.if])) {
					return `Expected field "${key}" to exist only if ${expected.if} was ${expected.in.join(" or ")}`;
				}
			} else if(expected.hasOwnProperty("notIn")) {
				if(~expected.notIn.indexOf(body[expected.if])) {
					return `Expected field "${key}" to exist only if ${expected.if} was not ${expected.notIn.join(" or ")}`;
				}
			}

			if(expected.hasOwnProperty("type")) {
				const check = checkValue(expected.type, key, body);
				if(check !== true) return check;
			}
		} else if(expected.hasOwnProperty("in")) {
			if(!~expected.in.indexOf(value)) {
				return `Expected field "${key}" to be ${expected.in.join(" or ")}`;
			}
		} else if(expected.hasOwnProperty("notIn")) {
			if(~expected.notIn.indexOf(value)) {
				return `Expected field "${key}" to not be ${expected.notIn.join(" or ")}`;
			}
		} else {
			if(typeof value !== "object") return `Expected field "${key}" to be an object, got ${typeof value}`;
			for(const [key2, type] of Object.entries(expected)) {
				const check = checkValue(type, key2, value);
				if(check !== true) return check;
			}
		}
	}

	return true;
};

const typeResultMap = {
	[String]: "string",
	[Boolean]: "boolean",
	[Object]: "object",
	[Number]: "number",
	[Array]: "array"
};

function convertType(type) {
	if(Array.isArray(type)) {
		return type.map(expectedType => convertType(expectedType));
	} else if(typeof type === "object" && !Array.isArray(type)) {
		if(type.hasOwnProperty("type")) type.type = convertType(type.type);
		else Object.entries(type).forEach(([key, value]) => type[key] = convertType(value));
	}

	return typeResultMap[type] || type;
}

module.exports = expectedBody => (req, res, next) => {
	for(const [key, type] of Object.entries(expectedBody)) {
		const check = checkValue(convertType(type), key, req.body);
		if(check !== true) {
			res.status(400).json({ error: check });
			return false;
		}
	}

	return next();
};
