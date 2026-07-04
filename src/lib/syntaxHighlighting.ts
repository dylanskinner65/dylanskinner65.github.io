import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import r from "react-syntax-highlighter/dist/esm/languages/prism/r";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";

// Only the languages that appear in src/content/**/*.md code fences (python,
// R, typescript, text) plus the CodeTabs lang values (python, typescript,
// javascript). Unregistered names — including uppercase "R" and "text" —
// render as plain text, exactly like the full Prism build did.
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("r", r);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);

export { SyntaxHighlighter };
export {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
