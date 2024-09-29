import{basicMarkupHtmlTags as b,hookDomPurifyHrefAndSrcSanitizer as x}from"../../../../base/browser/dom.js";import*as k from"../../../../base/browser/dompurify/dompurify.js";import{allowedMarkdownAttr as y}from"../../../../base/browser/markdownRenderer.js";import"../../../../base/common/cancellation.js";import*as w from"../../../../base/common/marked/marked.js";import{Schemas as h}from"../../../../base/common/network.js";import{escape as v}from"../../../../base/common/strings.js";import"../../../../editor/common/languages/language.js";import{tokenizeToString as E}from"../../../../editor/common/languages/textToHtmlTokenizer.js";import"../../../services/extensions/common/extensions.js";import{markedGfmHeadingIdPlugin as L}from"./markedGfmHeadingIdPlugin.js";const W=`
body {
	padding: 10px 20px;
	line-height: 22px;
	max-width: 882px;
	margin: 0 auto;
}

body *:last-child {
	margin-bottom: 0;
}

img {
	max-width: 100%;
	max-height: 100%;
}

a {
	text-decoration: var(--text-link-decoration);
}

a:hover {
	text-decoration: underline;
}

a:focus,
input:focus,
select:focus,
textarea:focus {
	outline: 1px solid -webkit-focus-ring-color;
	outline-offset: -1px;
}

hr {
	border: 0;
	height: 2px;
	border-bottom: 2px solid;
}

h1 {
	padding-bottom: 0.3em;
	line-height: 1.2;
	border-bottom-width: 1px;
	border-bottom-style: solid;
}

h1, h2, h3 {
	font-weight: normal;
}

table {
	border-collapse: collapse;
}

th {
	text-align: left;
	border-bottom: 1px solid;
}

th,
td {
	padding: 5px 10px;
}

table > tbody > tr + tr > td {
	border-top-width: 1px;
	border-top-style: solid;
}

blockquote {
	margin: 0 7px 0 5px;
	padding: 0 16px 0 10px;
	border-left-width: 5px;
	border-left-style: solid;
}

code {
	font-family: "SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;
}

pre {
	padding: 16px;
	border-radius: 3px;
	overflow: auto;
}

pre code {
	font-family: var(--vscode-editor-font-family);
	font-weight: var(--vscode-editor-font-weight);
	font-size: var(--vscode-editor-font-size);
	line-height: 1.5;
	color: var(--vscode-editor-foreground);
	tab-size: 4;
}

.monaco-tokenized-source {
	white-space: pre;
}

/** Theming */

.pre {
	background-color: var(--vscode-textCodeBlock-background);
}

.vscode-high-contrast h1 {
	border-color: rgb(0, 0, 0);
}

.vscode-light th {
	border-color: rgba(0, 0, 0, 0.69);
}

.vscode-dark th {
	border-color: rgba(255, 255, 255, 0.69);
}

.vscode-light h1,
.vscode-light hr,
.vscode-light td {
	border-color: rgba(0, 0, 0, 0.18);
}

.vscode-dark h1,
.vscode-dark hr,
.vscode-dark td {
	border-color: rgba(255, 255, 255, 0.18);
}

@media (forced-colors: active) and (prefers-color-scheme: light){
	body {
		forced-color-adjust: none;
	}
}

@media (forced-colors: active) and (prefers-color-scheme: dark){
	body {
		forced-color-adjust: none;
	}
}
`,M=[h.http,h.https,h.command];function T(d,n){const r=x(M,!0);try{return k.sanitize(d,{ALLOWED_TAGS:[...b,"checkbox","checklist"],ALLOWED_ATTR:[...y,"data-command","name","id","role","tabindex","x-dispatch","required","checked","placeholder","when-checked","checked-on"],...n?{ALLOW_UNKNOWN_PROTOCOLS:!0}:{}})}finally{r.dispose()}}async function q(d,n,r,t){const i=await new w.Marked(u.markedHighlight({async:!0,async highlight(c,a){if(typeof a!="string")return v(c);if(await n.whenInstalledExtensionsRegistered(),t?.token?.isCancellationRequested)return"";const l=r.getLanguageIdByLanguageName(a)??r.getLanguageIdByLanguageName(a.split(/\s+|:|,|(?!^)\{|\?]/,1)[0]);return E(r,c,l)}}),L(),...t?.markedExtensions??[]).parse(d,{async:!0});return t?.shouldSanitize??!0?T(i,t?.allowUnknownProtocols??!1):i}var u;(S=>{function d(e){if(typeof e=="function"&&(e={highlight:e}),!e||typeof e.highlight!="function")throw new Error("Must provide highlight function");return{async:!!e.async,walkTokens(o){if(o.type!=="code")return;const s=n(o.lang);if(e.async)return Promise.resolve(e.highlight(o.text,s,o.lang||"")).then(r(o));const g=e.highlight(o.text,s,o.lang||"");if(g instanceof Promise)throw new Error("markedHighlight is not set to async but the highlight function is async. Set the async option to true on markedHighlight to await the async highlight function.");r(o)(g)},renderer:{code({text:o,lang:s,escaped:g}){const f=s?` class="language-${p(s)}"`:"";return o=o.replace(/\n$/,""),`<pre><code${f}>${g?o:p(o,!0)}
</code></pre>`}}}}S.markedHighlight=d;function n(e){return(e||"").match(/\S*/)[0]}function r(e){return o=>{typeof o=="string"&&o!==e.text&&(e.escaped=!0,e.text=o)}}const t=/[&<>"']/,m=new RegExp(t.source,"g"),i=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,c=new RegExp(i.source,"g"),a={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},l=e=>a[e];function p(e,o){if(o){if(t.test(e))return e.replace(m,l)}else if(i.test(e))return e.replace(c,l);return e}})(u||={});export{W as DEFAULT_MARKDOWN_STYLES,q as renderMarkdownDocument};
