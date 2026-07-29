import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import r from "react-syntax-highlighter/dist/esm/languages/prism/r";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";

// Every language that appears in a src/content/**/*.md code fence, plus the
// CodeTabs lang values (python, typescript, javascript). Unregistered names
// render as plain, unhighlighted text — so this list has to be extended
// whenever a post introduces a new fence language. Keep it in sync with:
//   grep -rhoE '^```[a-zA-Z]+' src/content/ | sort -u
// "text" is intentionally absent: Prism has no `text` grammar, and plain
// output is the desired result for those fences.
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("r", r);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);

export {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
export { SyntaxHighlighter };
