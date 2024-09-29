import{Emitter as D}from"../../../../../base/common/event.js";import{Disposable as v}from"../../../../../base/common/lifecycle.js";import"../../../core/range.js";import"../../../model.js";import{BracketInfo as W,BracketPairWithMinIndentationInfo as K}from"../../../textModelBracketPairs.js";import"../../textModel.js";import"../../../textModelEvents.js";import"../../../languages/languageConfigurationRegistry.js";import{AstNodeKind as c}from"./ast.js";import{TextEditInfo as M}from"./beforeEditPositionMapper.js";import{LanguageAgnosticBracketTokens as R}from"./brackets.js";import{lengthAdd as m,lengthGreaterThanEqual as C,lengthLessThan as F,lengthLessThanEqual as I,lengthsToRange as p,lengthZero as B,positionToLength as x,toLength as f}from"./length.js";import{parseDocument as E}from"./parser.js";import{DenseKeyProvider as Q}from"./smallImmutableSet.js";import{FastTokenizer as U,TextBufferTokenizer as G}from"./tokenizer.js";import{BackgroundTokenizationState as w}from"../../../tokenizationTextModelPart.js";import"../../../core/position.js";import{CallbackIterable as N}from"../../../../../base/common/arrays.js";import{combineTextEditInfos as P}from"./combineTextEditInfos.js";import"../../../languages/supports/languageBracketsConfiguration.js";class xt extends v{constructor(t,n){super();this.textModel=t;this.getLanguageConfiguration=n;if(t.tokenization.hasTokens)t.tokenization.backgroundTokenizationState===w.Completed?(this.initialAstWithoutTokens=void 0,this.astWithTokens=this.parseDocumentFromTextBuffer([],void 0,!1)):(this.initialAstWithoutTokens=this.parseDocumentFromTextBuffer([],void 0,!0),this.astWithTokens=this.initialAstWithoutTokens);else{const e=this.brackets.getSingleLanguageBracketTokens(this.textModel.getLanguageId()),s=new U(this.textModel.getValue(),e);this.initialAstWithoutTokens=E(s,[],void 0,!0),this.astWithTokens=this.initialAstWithoutTokens}}didChangeEmitter=new D;initialAstWithoutTokens;astWithTokens;denseKeyProvider=new Q;brackets=new R(this.denseKeyProvider,this.getLanguageConfiguration);didLanguageChange(t){return this.brackets.didLanguageChange(t)}onDidChange=this.didChangeEmitter.event;queuedTextEditsForInitialAstWithoutTokens=[];queuedTextEdits=[];handleDidChangeBackgroundTokenizationState(){if(this.textModel.tokenization.backgroundTokenizationState===w.Completed){const t=this.initialAstWithoutTokens===void 0;this.initialAstWithoutTokens=void 0,t||this.didChangeEmitter.fire()}}handleDidChangeTokens({ranges:t}){const n=t.map(e=>new M(f(e.fromLineNumber-1,0),f(e.toLineNumber,0),f(e.toLineNumber-e.fromLineNumber+1,0)));this.handleEdits(n,!0),this.initialAstWithoutTokens||this.didChangeEmitter.fire()}handleContentChanged(t){const n=M.fromModelContentChanges(t.changes);this.handleEdits(n,!1)}handleEdits(t,n){const e=P(this.queuedTextEdits,t);this.queuedTextEdits=e,this.initialAstWithoutTokens&&!n&&(this.queuedTextEditsForInitialAstWithoutTokens=P(this.queuedTextEditsForInitialAstWithoutTokens,t))}flushQueue(){this.queuedTextEdits.length>0&&(this.astWithTokens=this.parseDocumentFromTextBuffer(this.queuedTextEdits,this.astWithTokens,!1),this.queuedTextEdits=[]),this.queuedTextEditsForInitialAstWithoutTokens.length>0&&(this.initialAstWithoutTokens&&(this.initialAstWithoutTokens=this.parseDocumentFromTextBuffer(this.queuedTextEditsForInitialAstWithoutTokens,this.initialAstWithoutTokens,!1)),this.queuedTextEditsForInitialAstWithoutTokens=[])}parseDocumentFromTextBuffer(t,n,e){const r=n,a=new G(this.textModel,this.brackets);return E(a,t,r,e)}getBracketsInRange(t,n){this.flushQueue();const e=f(t.startLineNumber-1,t.startColumn-1),s=f(t.endLineNumber-1,t.endColumn-1);return new N(r=>{const a=this.initialAstWithoutTokens||this.astWithTokens;A(a,B,a.length,e,s,r,0,0,new Map,n)})}getBracketPairsInRange(t,n){this.flushQueue();const e=x(t.getStartPosition()),s=x(t.getEndPosition());return new N(r=>{const a=this.initialAstWithoutTokens||this.astWithTokens,u=new V(r,n,this.textModel);L(a,B,a.length,e,s,u,0,new Map)})}getFirstBracketAfter(t){this.flushQueue();const n=this.initialAstWithoutTokens||this.astWithTokens;return z(n,B,n.length,x(t))}getFirstBracketBefore(t){this.flushQueue();const n=this.initialAstWithoutTokens||this.astWithTokens;return q(n,B,n.length,x(t))}}function q(i,o,t,n){if(i.kind===c.List||i.kind===c.Pair){const e=[];for(const s of i.children)t=m(o,s.length),e.push({nodeOffsetStart:o,nodeOffsetEnd:t}),o=t;for(let s=e.length-1;s>=0;s--){const{nodeOffsetStart:r,nodeOffsetEnd:a}=e[s];if(F(r,n)){const u=q(i.children[s],r,a,n);if(u)return u}}return null}else{if(i.kind===c.UnexpectedClosingBracket)return null;if(i.kind===c.Bracket){const e=p(o,t);return{bracketInfo:i.bracketInfo,range:e}}}return null}function z(i,o,t,n){if(i.kind===c.List||i.kind===c.Pair){for(const e of i.children){if(t=m(o,e.length),F(n,t)){const s=z(e,o,t,n);if(s)return s}o=t}return null}else{if(i.kind===c.UnexpectedClosingBracket)return null;if(i.kind===c.Bracket){const e=p(o,t);return{bracketInfo:i.bracketInfo,range:e}}}return null}function A(i,o,t,n,e,s,r,a,u,g,k=!1){if(r>200)return!0;t:for(;;)switch(i.kind){case c.List:{const l=i.childrenLength;for(let h=0;h<l;h++){const b=i.getChild(h);if(b){if(t=m(o,b.length),I(o,e)&&C(t,n)){if(C(t,e)){i=b;continue t}if(!A(b,o,t,n,e,s,r,0,u,g))return!1}o=t}}return!0}case c.Pair:{const l=!g||!i.closingBracket||i.closingBracket.bracketInfo.closesColorized(i.openingBracket.bracketInfo);let h=0;if(u){let d=u.get(i.openingBracket.text);d===void 0&&(d=0),h=d,l&&(d++,u.set(i.openingBracket.text,d))}const b=i.childrenLength;for(let d=0;d<b;d++){const T=i.getChild(d);if(T){if(t=m(o,T.length),I(o,e)&&C(t,n)){if(C(t,e)&&T.kind!==c.Bracket){i=T,l?(r++,a=h+1):a=h;continue t}if((l||T.kind!==c.Bracket||!i.closingBracket)&&!A(T,o,t,n,e,s,l?r+1:r,l?h+1:h,u,g,!i.closingBracket))return!1}o=t}}return u?.set(i.openingBracket.text,h),!0}case c.UnexpectedClosingBracket:{const l=p(o,t);return s(new W(l,r-1,0,!0))}case c.Bracket:{const l=p(o,t);return s(new W(l,r-1,a-1,k))}case c.Text:return!0}}class V{constructor(o,t,n){this.push=o;this.includeMinIndentation=t;this.textModel=n}}function L(i,o,t,n,e,s,r,a){if(r>200)return!0;let u=!0;if(i.kind===c.Pair){let g=0;if(a){let h=a.get(i.openingBracket.text);h===void 0&&(h=0),g=h,h++,a.set(i.openingBracket.text,h)}const k=m(o,i.openingBracket.length);let l=-1;if(s.includeMinIndentation&&(l=i.computeMinIndentation(o,s.textModel)),u=s.push(new K(p(o,t),p(o,k),i.closingBracket?p(m(k,i.child?.length||B),t):void 0,r,g,i,l)),o=k,u&&i.child){const h=i.child;if(t=m(o,h.length),I(o,e)&&C(t,n)&&(u=L(h,o,t,n,e,s,r+1,a),!u))return!1}a?.set(i.openingBracket.text,g)}else{let g=o;for(const k of i.children){const l=g;if(g=m(g,k.length),I(l,e)&&I(n,g)&&(u=L(k,l,g,n,e,s,r,a),!u))return!1}}return u}export{xt as BracketPairsTree};
