import{template as l}from"solid-js/web";import{delegateEvents as w}from"solid-js/web";import{spread as _}from"solid-js/web";import{mergeProps as b}from"solid-js/web";import{memo as L}from"solid-js/web";import{use as E}from"solid-js/web";import{insert as m}from"solid-js/web";import{createComponent as f}from"solid-js/web";var M=l("<div>"),D=l("<div class=w-full><div class=Editor><code class=Monaco></code><input>"),k=l("<div class=Error><span>&nbsp;&nbsp;&nbsp;"),x=l("<input type=hidden>");import{clearError as T,createForm as F,required as P,validate as O}from"@modular-forms/solid";import{editor as v}from"monaco-editor";import{createEffect as z,createSignal as A,on as H,onCleanup as B,onMount as I}from"solid-js";import"../Stylesheet/Element/Action.scss";import"../Stylesheet/Element/Editor.scss";var re=({Type:r}={Type:"HTML"})=>{const[a,{Form:i,Field:p}]=F(),g=A(W(r));let o,e;return I(()=>{console.log(o),o instanceof HTMLElement&&(e=v.create(o,{value:g[0](),language:r.toLowerCase(),automaticLayout:!0,lineNumbers:"off","semanticHighlighting.enabled":"configuredByTheme",autoClosingBrackets:"always",autoIndent:"full",tabSize:4,detectIndentation:!1,useTabStops:!0,minimap:{enabled:!1},scrollbar:{useShadows:!0,horizontal:"hidden",verticalScrollbarSize:10,verticalSliderSize:4,alwaysConsumeMouseWheel:!1},folding:!1,theme:window.matchMedia("(prefers-color-scheme: dark)").matches?"Dark":"Light",wrappingStrategy:"advanced",bracketPairColorization:{enabled:!0,independentColorPoolPerBracketType:!0},padding:{top:12,bottom:12},fixedOverflowWidgets:!0,tabCompletion:"on",acceptSuggestionOnEnter:"on",cursorWidth:5,roundedSelection:!0,matchBrackets:"always",autoSurround:"languageDefined",screenReaderAnnounceInlineSuggestion:!1,renderFinalNewline:"on",selectOnLineNumbers:!1,formatOnType:!0,formatOnPaste:!0,fontFamily:"'Source Code Pro'",fontWeight:"400",fontLigatures:!0,links:!1,fontSize:16}),e.getModel()?.setEOL(v.EndOfLineSequence.LF),e.onKeyDown(t=>{t.ctrlKey&&t.code==="KeyS"&&(t.preventDefault(),O(a),a.element?.submit())}),e.onDidChangeModelLanguageConfiguration(()=>e.getAction("editor.action.formatDocument")?.run()),e.onDidLayoutChange(()=>e.getAction("editor.action.formatDocument")?.run()),window.addEventListener("load",()=>e.getAction("editor.action.formatDocument")?.run()),setTimeout(()=>e.getAction("editor.action.formatDocument")?.run(),1e3),z(H(g[0],t=>e.getModel()?.setValue(t),{defer:!1})))}),B(()=>{console.log(o),console.log(2)}),(()=>{var t=M();return m(t,f(i,{method:"post",onSubmit:q,get children(){return[f(p,{name:"Content",get validate(){return[P(`Please enter some ${r}.`)]},children:(s,d)=>(()=>{var n=D(),h=n.firstChild,c=h.firstChild,C=c.nextSibling,$=o;return typeof $=="function"?E($,c):o=c,m(h,(()=>{var y=L(()=>!!s.error);return()=>y()&&(()=>{var u=k(),S=u.firstChild,K=S.firstChild;return u.$$click=()=>{T(a,"Content"),e.focus()},m(S,()=>s.error,null),u})()})(),C),_(C,b(d,{type:"hidden",required:!0}),!1,!1),n})()}),f(p,{name:"Field",children:(s,d)=>(()=>{var n=x();return _(n,b(d,{value:r}),!1,!1),n})()})]}})),t})()};const W=r=>{switch(r){case"CSS":return`
/* Example CSS Code */
body {

}			
`;case"HTML":return`
<!-- Example HTML Code -->
<!doctype html>
<html lang="en">
	<body>
	</body>
</html>
`;case"TypeScript":return`
/**
 * Example TypeScript Code
 */
export default () => ({});
`;default:return""}},q=({Content:r,Field:a},i)=>{i&&i.preventDefault()};w(["click"]);export{W as Return,q as Update,re as default};
