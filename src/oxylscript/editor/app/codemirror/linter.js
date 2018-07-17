import checker from "../../../ast/checker";
import ohm from "ohm-js";
import syntax from "../../../Syntax.ohm";

const grammar = ohm.grammar(syntax);
const matcher = grammar.matcher();

function positionToLine(string, position) {
	const previousLines = string.substring(0, position).split("\n");
	return {
		line: previousLines.length,
		char: position - previousLines.slice(1).reduce((a, b) => a + b.length, 0)
	};
}

export default CodeMirror => string => {
	matcher.setInput(string);
	const match = matcher.match();

	if(match.failed()) {
		const { line, char } = positionToLine(string, match.getRightmostFailurePosition());
		return [{
			message: match.shortMessage.substring(match.shortMessage.indexOf(":") + 1).trim(),
			severity: "error",
			from: CodeMirror.Pos(line, char), // eslint-disable-line new-cap
			to: CodeMirror.Pos(line, char, "after") // eslint-disable-line new-cap
		}];
	} else {
		const check = checker(match);

		if(check.failed()) {
			return check.errors.map(error => {
				const { line: lineFrom, char: charFrom } = positionToLine(string, error.startIndex);
				const { line: lineTo, char: charTo } = positionToLine(string, error.endIndex);

				return {
					message: error.message,
					severity: "error",
					from: CodeMirror.Pos(lineFrom, charFrom), // eslint-disable-line new-cap
					to: CodeMirror.Pos(lineTo, charTo) // eslint-disable-line new-cap
				};
			});
		}
	}

	return [];
};
