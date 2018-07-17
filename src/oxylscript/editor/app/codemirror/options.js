import "codemirror/addon/selection/active-line";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/dialog/dialog";
import "codemirror/addon/lint/lint";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/scroll/scrollpastend";
import "codemirror/addon/mode/simple";
import "codemirror/addon/search/search";
import "codemirror/addon/search/searchcursor";
import "codemirror/addon/scroll/simplescrollbars";

import CodeMirror from "codemirror";
import lint from "./linter";
import mode from "./mode";

CodeMirror.defineSimpleMode("oxylscript", mode);
global.cm = CodeMirror;

export default {
	lint: lint(CodeMirror),
	gutters: ["CodeMirror-lint-markers"],
	autoCloseBrackets: true,
	scrollPastEnd: true,
	matchBrackets: true,
	styleActiveLine: true,
	lineNumbers: true,
	line: true,
	styleSelectedText: true,
	showCursorWhenSelecting: true,
	scrollbarStyle: "overlay",
	indentWithTabs: true,
	tabSize: 4,
	autofocus: true,
	theme: "pastel-on-dark",
	mode: "oxylscript",
	keyMap: "default",
	dragDrop: false
};
