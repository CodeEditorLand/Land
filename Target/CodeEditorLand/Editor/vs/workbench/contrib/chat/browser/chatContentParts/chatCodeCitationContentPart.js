var h=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var C=(r,o,e,n)=>{for(var t=n>1?void 0:n?b(o,e):o,a=r.length-1,i;a>=0;a--)(i=r[a])&&(t=(n?i(o,e,t):i(t))||t);return n&&t&&h(o,e,t),t},m=(r,o)=>(e,n)=>o(e,n,r);import*as u from"../../../../../base/browser/dom.js";import{Button as f}from"../../../../../base/browser/ui/button/button.js";import{Disposable as I}from"../../../../../base/common/lifecycle.js";import{localize as g}from"../../../../../nls.js";import{ITelemetryService as v}from"../../../../../platform/telemetry/common/telemetry.js";import"../chat.js";import"./chatContentParts.js";import{getCodeCitationsMessage as S}from"../../common/chatModel.js";import"../../common/chatViewModel.js";import{IEditorService as y}from"../../../../services/editor/common/editorService.js";let d=class extends I{constructor(e,n,t,a){super();this.editorService=t;this.telemetryService=a;const i=S(e.citations),c=u.h(".chat-code-citation-message@root",[u.h("span.chat-code-citation-label@label"),u.h(".chat-code-citation-button-container@button")]);c.label.textContent=i+" - ";const l=this._register(new f(c.button,{buttonBackground:void 0,buttonBorder:void 0,buttonForeground:void 0,buttonHoverBackground:void 0,buttonSecondaryBackground:void 0,buttonSecondaryForeground:void 0,buttonSecondaryHoverBackground:void 0,buttonSeparator:void 0}));l.label=g("viewMatches","View matches"),this._register(l.onDidClick(()=>{const p=`# Code Citations

`+e.citations.map(s=>`## License: ${s.license}
${s.value.toString()}

\`\`\`
${s.snippet}
\`\`\`

`).join(`
`);this.editorService.openEditor({resource:void 0,contents:p,languageId:"markdown"}),this.telemetryService.publicLog2("openedChatCodeCitations")})),this.domNode=c.root}domNode;hasSameContent(e,n,t){return e.kind==="codeCitations"}};d=C([m(2,y),m(3,v)],d);export{d as ChatCodeCitationContentPart};
