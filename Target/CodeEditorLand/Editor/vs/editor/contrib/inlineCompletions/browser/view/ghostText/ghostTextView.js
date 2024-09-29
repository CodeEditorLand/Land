var D=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var C=(d,h,t,e)=>{for(var n=e>1?void 0:e?E(h,t):h,o=d.length-1,r;o>=0;o--)(r=d[o])&&(n=(e?r(h,t,n):r(n))||n);return e&&n&&D(h,t,n),n},T=(d,h)=>(t,e)=>h(t,e,d);import{createTrustedTypesPolicy as Z}from"../../../../../../base/browser/trustedTypes.js";import{Event as N}from"../../../../../../base/common/event.js";import{Disposable as w,toDisposable as k}from"../../../../../../base/common/lifecycle.js";import{autorun as H,derived as I,observableSignalFromEvent as W,observableValue as A}from"../../../../../../base/common/observable.js";import*as R from"../../../../../../base/common/strings.js";import{applyFontInfo as G}from"../../../../../browser/config/domFontInfo.js";import"../../../../../browser/editorBrowser.js";import{observableCodeEditor as z}from"../../../../../browser/observableCodeEditor.js";import{EditorFontLigatures as F,EditorOption as l}from"../../../../../common/config/editorOptions.js";import{OffsetEdit as P,SingleOffsetEdit as B}from"../../../../../common/core/offsetEdit.js";import{Position as V}from"../../../../../common/core/position.js";import{Range as j}from"../../../../../common/core/range.js";import{StringBuilder as U}from"../../../../../common/core/stringBuilder.js";import{ILanguageService as q}from"../../../../../common/languages/language.js";import{InjectedTextCursorStops as J,PositionAffinity as K}from"../../../../../common/model.js";import{LineEditWithAdditionalLines as Q}from"../../../../../common/tokenizationTextModelPart.js";import{LineTokens as X}from"../../../../../common/tokens/lineTokens.js";import{LineDecoration as y}from"../../../../../common/viewLayout/lineDecorations.js";import{RenderLineInput as Y,renderViewLine as $}from"../../../../../common/viewLayout/viewLineRenderer.js";import{InlineDecorationType as _}from"../../../../../common/viewModel.js";import{GhostTextReplacement as ee}from"../../model/ghostText.js";import{ColumnRange as te}from"../../utils.js";import"./ghostTextView.css";let v=class extends w{constructor(t,e,n){super();this._editor=t;this._model=e;this._languageService=n;this._register(k(()=>{this._isDisposed.set(!0,void 0)})),this._register(this._editorObs.setDecorations(this.decorations))}_isDisposed=A(this,!1);_editorObs=z(this._editor);_useSyntaxHighlighting=this._editorObs.getOption(l.inlineSuggest).map(t=>t.syntaxHighlightingEnabled);uiState=I(this,t=>{if(this._isDisposed.read(t))return;const e=this._editorObs.model.read(t);if(e!==this._model.targetTextModel.read(t))return;const n=this._model.ghostText.read(t);if(!n)return;const o=n instanceof ee?n.columnRange:void 0,r=this._useSyntaxHighlighting.read(t),g=r?" syntax-highlighted":"",{inlineTexts:u,additionalLines:a,hiddenRange:s}=ne(n,e,"ghost-text"+g),i=new P(u.map(p=>B.insert(p.column-1,p.text))),c=r?e.tokenization.tokenizeLineWithEdit(n.lineNumber,new Q(i,a.map(p=>p.content))):void 0,x=i.getNewTextRanges(),m=u.map((p,f)=>({...p,tokens:c?.mainLineTokens?.getTokensInRange(x[f])})),L=a.map((p,f)=>({content:c?.additionalLines?.[f]??X.createEmpty(p.content,this._languageService.languageIdCodec),decorations:p.decorations}));return{replacedRange:o,inlineTexts:m,additionalLines:L,hiddenRange:s,lineNumber:n.lineNumber,additionalReservedLineCount:this._model.minReservedLineCount.read(t),targetTextModel:e,syntaxHighlightingEnabled:r}});decorations=I(this,t=>{const e=this.uiState.read(t);if(!e)return[];const n=[],o=e.syntaxHighlightingEnabled?" syntax-highlighted":"";e.replacedRange&&n.push({range:e.replacedRange.toRange(e.lineNumber),options:{inlineClassName:"inline-completion-text-to-replace"+o,description:"GhostTextReplacement"}}),e.hiddenRange&&n.push({range:e.hiddenRange.toRange(e.lineNumber),options:{inlineClassName:"ghost-text-hidden",description:"ghost-text-hidden"}});for(const r of e.inlineTexts)n.push({range:j.fromPositions(new V(e.lineNumber,r.column)),options:{description:"ghost-text-decoration",after:{content:r.text,tokens:r.tokens,inlineClassName:r.preview?"ghost-text-decoration-preview":"ghost-text-decoration"+o,cursorStops:J.Left},showIfCollapsed:!0}});return n});additionalLinesWidget=this._register(new ie(this._editor,I(t=>{const e=this.uiState.read(t);return e?{lineNumber:e.lineNumber,additionalLines:e.additionalLines,minReservedLineCount:e.additionalReservedLineCount,targetTextModel:e.targetTextModel}:void 0})));ownsViewZone(t){return this.additionalLinesWidget.viewZoneId===t}};v=C([T(2,q)],v);function ne(d,h,t){const e=[],n=[];function o(s,i){if(n.length>0){const c=n[n.length-1];i&&c.decorations.push(new y(c.content.length+1,c.content.length+1+s[0].length,i,_.Regular)),c.content+=s[0],s=s.slice(1)}for(const c of s)n.push({content:c,decorations:i?[new y(1,c.length+1,i,_.Regular)]:[]})}const r=h.getLineContent(d.lineNumber);let g,u=0;for(const s of d.parts){let i=s.lines;g===void 0?(e.push({column:s.column,text:i[0],preview:s.preview}),i=i.slice(1)):o([r.substring(u,s.column-1)],void 0),i.length>0&&(o(i,t),g===void 0&&s.column<=r.length&&(g=s.column)),u=s.column-1}g!==void 0&&o([r.substring(u)],void 0);const a=g!==void 0?new te(g,r.length+1):void 0;return{inlineTexts:e,additionalLines:n,hiddenRange:a}}class ie extends w{constructor(t,e){super();this.editor=t;this.lines=e;this._register(H(n=>{const o=this.lines.read(n);this.editorOptionsChanged.read(n),o?this.updateLines(o.lineNumber,o.additionalLines,o.minReservedLineCount):this.clear()}))}_viewZoneId=void 0;get viewZoneId(){return this._viewZoneId}editorOptionsChanged=W("editorOptionChanged",N.filter(this.editor.onDidChangeConfiguration,t=>t.hasChanged(l.disableMonospaceOptimizations)||t.hasChanged(l.stopRenderingLineAfter)||t.hasChanged(l.renderWhitespace)||t.hasChanged(l.renderControlCharacters)||t.hasChanged(l.fontLigatures)||t.hasChanged(l.fontInfo)||t.hasChanged(l.lineHeight)));dispose(){super.dispose(),this.clear()}clear(){this.editor.changeViewZones(t=>{this._viewZoneId&&(t.removeZone(this._viewZoneId),this._viewZoneId=void 0)})}updateLines(t,e,n){const o=this.editor.getModel();if(!o)return;const{tabSize:r}=o.getOptions();this.editor.changeViewZones(g=>{this._viewZoneId&&(g.removeZone(this._viewZoneId),this._viewZoneId=void 0);const u=Math.max(e.length,n);if(u>0){const a=document.createElement("div");oe(a,r,e,this.editor.getOptions()),this._viewZoneId=g.addZone({afterLineNumber:t,heightInLines:u,domNode:a,afterColumnAffinity:K.Right})}})}}function oe(d,h,t,e){const n=e.get(l.disableMonospaceOptimizations),o=e.get(l.stopRenderingLineAfter),r="none",g=e.get(l.renderControlCharacters),u=e.get(l.fontLigatures),a=e.get(l.fontInfo),s=e.get(l.lineHeight),i=new U(1e4);i.appendString('<div class="suggest-preview-text">');for(let m=0,L=t.length;m<L;m++){const p=t[m],f=p.content;i.appendString('<div class="view-line'),i.appendString('" style="top:'),i.appendString(String(m*s)),i.appendString('px;width:1000000px;">');const b=f.getLineContent(),M=R.isBasicASCII(b),O=R.containsRTL(b);$(new Y(a.isMonospace&&!n,a.canUseHalfwidthRightwardsArrow,b,!1,M,O,0,f,p.decorations,h,0,a.spaceWidth,a.middotWidth,a.wsmiddotWidth,o,r,g,u!==F.OFF,null),i),i.appendString("</div>")}i.appendString("</div>"),G(d,a);const c=i.build(),x=S?S.createHTML(c):c;d.innerHTML=x}const S=Z("editorGhostText",{createHTML:d=>d});export{ie as AdditionalLinesWidget,v as GhostTextView,S as ttPolicy};
