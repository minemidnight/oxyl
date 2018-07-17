class CheckResult {
	constructor() {
		this.succeeded = true;
		this.errors = [];
	}

	succeeded() {
		return this.succeeded;
	}

	failed() {
		return !this.succeeded;
	}

	addError(message, start, end) {
		this.succeeded = false;
		this.errors.push({
			message,
			startIndex: start,
			endIndex: end
		});
	}

	get message() {
		return this.errors
			.map(error => `${error.startIndex} - ${error.endIndex}: ${error.message}`)
			.join("\n");
	}
}

module.exports = CheckResult;
