var v=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var c=(d,r,e,t)=>{for(var i=t>1?void 0:t?h(r,e):r,a=d.length-1,o;a>=0;a--)(o=d[a])&&(i=(t?o(r,e,i):o(i))||i);return t&&i&&v(r,e,i),i},n=(d,r)=>(e,t)=>r(e,t,d);import"../../../../base/browser/dom.js";import"../../../../base/common/cancellation.js";import{IContextKeyService as p}from"../../../../platform/contextkey/common/contextkey.js";import"../../../../platform/editor/common/editor.js";import{IInstantiationService as l}from"../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as S}from"../../../../platform/instantiation/common/serviceCollection.js";import{IStorageService as u,StorageScope as I,StorageTarget as g}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as f}from"../../../../platform/telemetry/common/telemetry.js";import{editorBackground as m,editorForeground as w,inputBackground as C}from"../../../../platform/theme/common/colorRegistry.js";import{IThemeService as E}from"../../../../platform/theme/common/themeService.js";import{EditorPane as _}from"../../../browser/parts/editor/editorPane.js";import"../../../common/editor.js";import{Memento as y}from"../../../common/memento.js";import{clearChatEditor as x}from"./actions/chatClear.js";import{ChatEditorInput as D}from"./chatEditorInput.js";import{ChatWidget as M}from"./chatWidget.js";import{ChatAgentLocation as V}from"../common/chatAgents.js";import"../common/chatModel.js";import{CHAT_PROVIDER_ID as K}from"../common/chatParticipantContribTypes.js";import"../../../services/editor/common/editorGroupsService.js";import{EDITOR_DRAG_AND_DROP_BACKGROUND as O}from"../../../common/theme.js";let s=class extends _{constructor(e,t,i,a,o,b){super(D.EditorID,e,t,i,o);this.instantiationService=a;this.storageService=o;this.contextKeyService=b}widget;_scopedContextKeyService;get scopedContextKeyService(){return this._scopedContextKeyService}_memento;_viewState;async clear(){if(this.input)return this.instantiationService.invokeFunction(x,this.input)}createEditor(e){this._scopedContextKeyService=this._register(this.contextKeyService.createScoped(e));const t=this._register(this.instantiationService.createChild(new S([p,this.scopedContextKeyService])));this.widget=this._register(t.createInstance(M,V.Panel,void 0,{supportsFileReferences:!0},{listForeground:w,listBackground:m,overlayBackground:O,inputEditorBackground:C,resultEditorBackground:m})),this._register(this.widget.onDidClear(()=>this.clear())),this.widget.render(e),this.widget.setVisible(!0)}setEditorVisible(e){super.setEditorVisible(e),this.widget?.setVisible(e)}focus(){super.focus(),this.widget?.focusInput()}clearInput(){this.saveState(),super.clearInput()}async setInput(e,t,i,a){super.setInput(e,t,i,a);const o=await e.resolve();if(!o)throw new Error(`Failed to get model for chat editor. id: ${e.sessionId}`);if(!this.widget)throw new Error("ChatEditor lifecycle issue: no editor widget");this.updateModel(o.model,t?.viewState??e.options.viewState)}updateModel(e,t){this._memento=new y("interactive-session-editor-"+K,this.storageService),this._viewState=t??this._memento.getMemento(I.WORKSPACE,g.MACHINE),this.widget.setModel(e,{...this._viewState})}saveState(){if(this.widget?.saveState(),this._memento&&this._viewState){const e=this.widget.getViewState();this._viewState.inputValue=e.inputValue,this._viewState.selectedLanguageModelId=e.selectedLanguageModelId,this._memento.saveMemento()}}getViewState(){return{...this._viewState}}layout(e,t){this.widget&&this.widget.layout(e.height,e.width)}};s=c([n(1,f),n(2,E),n(3,l),n(4,u),n(5,p)],s);export{s as ChatEditor};
