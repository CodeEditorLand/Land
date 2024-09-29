var z=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var B=(r,e,t,i)=>{for(var o=i>1?void 0:i?j(e,t):e,n=r.length-1,s;n>=0;n--)(s=r[n])&&(o=(i?s(e,t,o):s(o))||o);return i&&o&&z(e,t,o),o},V=(r,e)=>(t,i)=>e(t,i,r);import{coalesce as Y}from"../../../../../base/common/arrays.js";import{Codicon as w}from"../../../../../base/common/codicons.js";import{fromNowByDay as J}from"../../../../../base/common/date.js";import{KeyCode as y,KeyMod as h}from"../../../../../base/common/keyCodes.js";import{DisposableStore as L}from"../../../../../base/common/lifecycle.js";import{ThemeIcon as x}from"../../../../../base/common/themables.js";import"../../../../../editor/browser/editorBrowser.js";import{EditorAction2 as Z}from"../../../../../editor/browser/editorExtensions.js";import{localize as C,localize2 as l}from"../../../../../nls.js";import{Action2 as v,MenuId as A,MenuItemAction as ee,MenuRegistry as te,registerAction2 as I,SubmenuItemAction as ie}from"../../../../../platform/actions/common/actions.js";import{ContextKeyExpr as p}from"../../../../../platform/contextkey/common/contextkey.js";import{IsLinuxContext as oe,IsWindowsContext as re}from"../../../../../platform/contextkey/common/contextkeys.js";import{KeybindingWeight as E}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{IQuickInputService as ne}from"../../../../../platform/quickinput/common/quickInput.js";import{clearChatEditor as se}from"./chatClear.js";import{CHAT_VIEW_ID as D,IChatWidgetService as W,showChatView as ce}from"../chat.js";import"../chatEditor.js";import{ChatEditorInput as H}from"../chatEditorInput.js";import"../chatViewPane.js";import{CONTEXT_CHAT_ENABLED as b,CONTEXT_CHAT_INPUT_CURSOR_AT_TOP as ae,CONTEXT_CHAT_LOCATION as de,CONTEXT_IN_CHAT_INPUT as N,CONTEXT_IN_CHAT_SESSION as q,CONTEXT_IN_QUICK_CHAT as P}from"../../common/chatContextKeys.js";import{IChatService as M}from"../../common/chatService.js";import{isRequestVM as ue}from"../../common/chatViewModel.js";import{IChatWidgetHistoryService as pe}from"../../common/chatWidgetHistoryService.js";import{IEditorGroupsService as me}from"../../../../services/editor/common/editorGroupsService.js";import{ACTIVE_GROUP as he,IEditorService as K}from"../../../../services/editor/common/editorService.js";import{IViewsService as R}from"../../../../services/views/common/viewsService.js";import"../../../../common/contributions.js";import{IActionViewItemService as le}from"../../../../../platform/actions/browser/actionViewItemService.js";import{ChatAgentLocation as F,IChatAgentService as Ce}from"../../common/chatAgents.js";import{IInstantiationService as Ie}from"../../../../../platform/instantiation/common/instantiation.js";import{DropdownWithPrimaryActionViewItem as ge}from"../../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";import{toAction as fe}from"../../../../../base/common/actions.js";import{extractAgentAndCommand as we}from"../../common/chatParserTypes.js";import{Position as ye}from"../../../../../editor/common/core/position.js";import{SuggestController as ve}from"../../../../../editor/contrib/suggest/browser/suggestController.js";function wt(r){return r instanceof Object&&"chatView"in r}const S=l("chat.category","Chat"),X="workbench.action.chat.open";class _ extends v{static TITLE=l("openChat","Open Chat");constructor(){super({id:X,title:_.TITLE,icon:w.commentDiscussion,f1:!0,category:S,keybinding:{weight:E.WorkbenchContrib,primary:h.CtrlCmd|h.Alt|y.KeyI,mac:{primary:h.CtrlCmd|h.WinCtrl|y.KeyI}},menu:{id:A.ChatCommandCenter,group:"a_chat",order:1}})}async run(e,t){t=typeof t=="string"?{query:t}:t;const i=e.get(M),o=await ce(e.get(R));if(o){if(t?.previousRequests?.length&&o.viewModel)for(const{request:n,response:s}of t.previousRequests)i.addCompleteRequest(o.viewModel.sessionId,n,void 0,0,{message:s});t?.query&&(t.isPartialQuery?o.setInput(t.query):o.acceptInput(t.query)),o.focusInput()}}}class Ae extends v{constructor(){super({id:"workbench.action.chat.history",title:l("chat.history.label","Show Chats..."),menu:{id:A.ViewTitle,when:p.equals("view",D),group:"navigation",order:2},category:S,icon:w.history,f1:!0,precondition:b})}async run(e){const t=e.get(M),i=e.get(ne),o=e.get(R),n=e.get(K),s=()=>{const c={iconClass:x.asClassName(w.file),tooltip:C("interactiveSession.history.editor","Open in Editor")},a={iconClass:x.asClassName(w.x),tooltip:C("interactiveSession.history.delete","Delete")},g={iconClass:x.asClassName(w.pencil),tooltip:C("chat.history.rename","Rename")},Q=()=>{const d=t.getHistory();d.sort((f,T)=>(T.lastMessageDate??0)-(f.lastMessageDate??0));let m;const U=d.flatMap(f=>{const T=J(f.lastMessageDate,!0,!0),G=T!==m?{type:"separator",label:T}:void 0;return m=T,[G,{label:f.title,description:f.isActive?`(${C("currentChatLabel","current")})`:"",chat:f,buttons:f.isActive?[g]:[g,c,a]}]});return Y(U)},k=new L,u=k.add(i.createQuickPick({useSeparators:!0}));u.placeholder=C("interactiveSession.history.pick","Switch to chat");const $=Q();u.items=$,k.add(u.onDidTriggerItemButton(async d=>{if(d.button===c){const m={target:{sessionId:d.item.chat.sessionId},pinned:!0};n.openEditor({resource:H.getNewEditorUri(),options:m},he),u.hide()}else if(d.button===a)t.removeHistoryEntry(d.item.chat.sessionId),u.items=Q();else if(d.button===g){const m=await i.input({title:C("newChatTitle","New chat title"),value:d.item.chat.title});m&&t.setChatSessionTitle(d.item.chat.sessionId,m),s()}})),k.add(u.onDidAccept(async()=>{try{const m=u.selectedItems[0].chat.sessionId;(await o.openView(D)).loadSession(m)}finally{u.hide()}})),k.add(u.onDidHide(()=>k.dispose())),u.show()};s()}}class Se extends v{constructor(){super({id:"workbench.action.openChat",title:l("interactiveSession.open","Open Editor"),f1:!0,category:S,precondition:b})}async run(e){await e.get(K).openEditor({resource:H.getNewEditorUri(),options:{pinned:!0}})}}class Ee extends v{constructor(){super({id:"workbench.action.chat.addParticipant",title:l("chatWith","Chat with Extension"),icon:w.mention,f1:!1,category:S,menu:{id:A.ChatInput,when:de.isEqualTo(F.Panel),group:"navigation",order:1}})}async run(e,...t){const i=e.get(W),n=t[0]?.widget??i.lastFocusedWidget;if(!n)return;const s=we(n.parsedInput);if(s?.agentPart||s?.commandPart)return;const c=ve.get(n.inputEditor);if(c){const a=n.inputEditor.getValue(),g=a?`@ ${a}`:"@";a.startsWith("@")||n.inputEditor.setValue(g),n.inputEditor.setPosition(new ye(1,2)),c.triggerSuggest(void 0,!0)}}}function Et(){I(_),I(Ae),I(Se),I(Ee),I(class extends v{constructor(){super({id:"workbench.action.chat.clearInputHistory",title:l("interactiveSession.clearHistory.label","Clear Input History"),precondition:b,category:S,f1:!0})}async run(e,...t){e.get(pe).clearHistory()}}),I(class extends v{constructor(){super({id:"workbench.action.chat.clearHistory",title:l("chat.clear.label","Clear All Workspace Chats"),precondition:b,category:S,f1:!0})}async run(e,...t){const i=e.get(me),o=e.get(R);e.get(M).clearAllHistoryEntries();const s=o.getViewWithId(D);s&&s.widget.clear(),i.groups.forEach(c=>{c.editors.forEach(a=>{a instanceof H&&se(e,a)})})}}),I(class extends Z{constructor(){super({id:"chat.action.focus",title:l("actions.interactiveSession.focus","Focus Chat List"),precondition:p.and(N),category:S,keybinding:[{when:p.and(ae,P.negate()),primary:h.CtrlCmd|y.UpArrow,weight:E.EditorContrib},{when:p.and(p.or(re,oe),P.negate()),primary:h.CtrlCmd|y.UpArrow,weight:E.EditorContrib},{when:p.and(q,P),primary:h.CtrlCmd|y.DownArrow,weight:E.WorkbenchContrib}]})}runEditorCommand(e,t){const i=t.getModel()?.uri;i&&e.get(W).getWidgetByInputUri(i)?.focusLastMessage()}}),I(class extends v{constructor(){super({id:"workbench.action.chat.focusInput",title:l("interactiveSession.focusInput.label","Focus Chat Input"),f1:!1,keybinding:[{primary:h.CtrlCmd|y.DownArrow,weight:E.WorkbenchContrib,when:p.and(q,N.negate(),P.negate())},{when:p.and(q,N.negate(),P),primary:h.CtrlCmd|y.UpArrow,weight:E.WorkbenchContrib}]})}run(e,...t){e.get(W).lastFocusedWidget?.focusInput()}})}function kt(r,e=!0){return ue(r)?(e?`${r.username}: `:"")+r.messageText:(e?`${r.username}: `:"")+r.response.toString()}te.appendMenuItem(A.CommandCenter,{submenu:A.ChatCommandCenter,title:C("title4","Chat"),icon:w.commentDiscussion,when:p.and(b,p.has("config.chat.commandCenter.enabled")),order:10001});let O=class{static ID="chat.commandCenterRendering";_store=new L;constructor(e,t,i){const o=`submenuitem.${A.ChatCommandCenter.id}`;this._store.add(e.register(A.CommandCenter,o,(n,s)=>{const c=t.getDefaultAgent(F.Panel);if(!c?.metadata.themeIcon||!(n instanceof ie))return;const a=fe({id:c.id,label:C("more","More..."),run(){}}),g=i.createInstance(ee,{id:X,title:_.TITLE,icon:c.metadata.themeIcon},void 0,void 0,void 0,void 0);return i.createInstance(ge,g,a,n.actions,"",s)},t.onDidChangeAgents))}dispose(){this._store.dispose()}};O=B([V(0,le),V(1,Ce),V(2,Ie)],O);export{S as CHAT_CATEGORY,X as CHAT_OPEN_ACTION_ID,O as ChatCommandCenterRendering,wt as isChatViewTitleActionContext,Et as registerChatActions,kt as stringifyItem};
