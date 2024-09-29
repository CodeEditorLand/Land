var E=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var C=(u,d,t,i)=>{for(var o=i>1?void 0:i?S(d,t):d,m=u.length-1,l;m>=0;m--)(l=u[m])&&(o=(i?l(d,t,o):l(o))||o);return i&&o&&E(d,t,o),o},p=(u,d)=>(t,i)=>d(t,i,u);import{reset as M}from"../../../../../../base/browser/dom.js";import{ActionBar as L}from"../../../../../../base/browser/ui/actionbar/actionbar.js";import{renderLabelWithIcons as R}from"../../../../../../base/browser/ui/iconLabel/iconLabels.js";import{CompareResult as D}from"../../../../../../base/common/arrays.js";import{BugIndicatingError as T}from"../../../../../../base/common/errors.js";import{toDisposable as y}from"../../../../../../base/common/lifecycle.js";import{autorun as I,autorunWithStore as B,derived as _}from"../../../../../../base/common/observable.js";import{MinimapPosition as N,OverviewRulerLane as k}from"../../../../../../editor/common/model.js";import{localize as h}from"../../../../../../nls.js";import{MenuId as O}from"../../../../../../platform/actions/common/actions.js";import{IConfigurationService as A}from"../../../../../../platform/configuration/common/configuration.js";import{IContextKeyService as G}from"../../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as W}from"../../../../../../platform/instantiation/common/instantiation.js";import{ILabelService as H}from"../../../../../../platform/label/common/label.js";import{LineRange as V}from"../../model/lineRange.js";import{applyObservableDecorations as j,join as K}from"../../utils.js";import{handledConflictMinimapOverViewRulerColor as w,unhandledConflictMinimapOverViewRulerColor as x}from"../colors.js";import{EditorGutter as P}from"../editorGutter.js";import"../viewModel.js";import{ctxIsMergeResultEditor as z}from"../../../common/mergeEditor.js";import{CodeEditorView as U,createSelectionsAutorun as q,TitleMenu as F}from"./codeEditorView.js";let b=class extends U{constructor(t,i,o,m){super(i,t,m);this._labelService=o;this.editor.invokeWithinContext(s=>{const e=s.get(G),c=z.bindTo(e);c.set(!0),this._register(y(()=>c.reset()))}),this.htmlElements.gutterDiv.style.width="5px",this.htmlElements.root.classList.add("result"),this._register(B((s,e)=>{this.checkboxesVisible.read(s)&&e.add(new P(this.editor,this.htmlElements.gutterDiv,{getIntersectingGutterItems:(c,n)=>[],createView:(c,n)=>{throw new T}}))})),this._register(I(s=>{const e=this.viewModel.read(s);e&&(this.editor.setModel(e.model.resultTextModel),M(this.htmlElements.title,...R(h("result","Result"))),M(this.htmlElements.description,...R(this._labelService.getUriLabel(e.model.resultTextModel.uri,{relative:!0}))))}));const l=this._register(new L(this.htmlElements.detail));this._register(I(s=>{const e=this.viewModel.read(s);if(!e)return;const c=e.model;if(!c)return;const n=c.unhandledConflictsCount.read(s),r=n===1?h("mergeEditor.remainingConflicts","{0} Conflict Remaining",n):h("mergeEditor.remainingConflict","{0} Conflicts Remaining ",n);l.clear(),l.push({class:void 0,enabled:n>0,id:"nextConflict",label:r,run(){e.model.telemetry.reportConflictCounterClicked(),e.goToNextModifiedBaseRange(a=>!c.isHandled(a).get())},tooltip:n>0?h("goToNextConflict","Go to next conflict"):h("allConflictHandled","All conflicts handled, the merge can be completed now.")})})),this._register(j(this.editor,this.decorations)),this._register(q(this,(s,e)=>e.model.translateBaseRangeToResult(s))),this._register(i.createInstance(F,O.MergeInputResultToolbar,this.htmlElements.toolbar))}decorations=_(this,t=>{const i=this.viewModel.read(t);if(!i)return[];const o=i.model,m=o.resultTextModel,l=new Array,s=K(o.modifiedBaseRanges.read(t),o.baseResultDiffs.read(t),(n,r)=>n.baseRange.touches(r.inputRange)?D.neitherLessOrGreaterThan:V.compareByStart(n.baseRange,r.inputRange)),e=i.activeModifiedBaseRange.read(t),c=i.showNonConflictingChanges.read(t);for(const n of s){const r=n.left;if(r){const a=["merge-editor-block"];let g=[0,0,0,0];const f=o.isHandled(r).read(t);if(f&&a.push("handled"),r===e&&(a.push("focused"),g=[0,2,0,2]),r.isConflicting&&a.push("conflicting"),a.push("result"),!r.isConflicting&&!c&&f)continue;const v=o.getLineRangeInResult(r.baseRange,t);l.push({range:v.toInclusiveRangeOrEmpty(),options:{showIfCollapsed:!0,blockClassName:a.join(" "),blockPadding:g,blockIsAfterEnd:v.startLineNumber>m.getLineCount(),description:"Result Diff",minimap:{position:N.Gutter,color:{id:f?w:x}},overviewRuler:r.isConflicting?{position:k.Center,color:{id:f?w:x}}:void 0}})}if(!r||r.isConflicting)for(const a of n.rights){const g=a.outputRange.toInclusiveRange();if(g&&l.push({range:g,options:{className:"merge-editor-diff result",description:"Merge Editor",isWholeLine:!0}}),a.rangeMappings)for(const f of a.rangeMappings)l.push({range:f.outputRange,options:{className:"merge-editor-diff-word result",description:"Merge Editor"}})}}return l})};b=C([p(1,W),p(2,H),p(3,A)],b);export{b as ResultCodeEditorView};
