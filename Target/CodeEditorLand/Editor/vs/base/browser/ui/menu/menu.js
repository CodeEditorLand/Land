import{isFirefox as q}from"../../browser.js";import{EventType as _,Gesture as R}from"../../touch.js";import{$ as f,addDisposableListener as l,append as g,clearNode as W,createStyleSheet as V,Dimension as H,EventHelper as p,EventType as u,getActiveElement as M,getWindow as w,isAncestor as x,isInShadowDOM as N}from"../../dom.js";import{StandardKeyboardEvent as v}from"../../keyboardEvent.js";import{StandardMouseEvent as Y}from"../../mouseEvent.js";import{ActionBar as G,ActionsOrientation as j}from"../actionbar/actionbar.js";import{ActionViewItem as X,BaseActionViewItem as J}from"../actionbar/actionViewItems.js";import{layout as F,LayoutAnchorPosition as k}from"../contextview/contextview.js";import{DomScrollableElement as Q}from"../scrollbar/scrollableElement.js";import{EmptySubmenuAction as Z,Separator as E,SubmenuAction as ee}from"../../../common/actions.js";import{RunOnceScheduler as A}from"../../../common/async.js";import{Codicon as I}from"../../../common/codicons.js";import{getCodiconFontCharacters as te}from"../../../common/codiconsUtil.js";import{ThemeIcon as U}from"../../../common/themables.js";import"../../../common/event.js";import{stripIcons as ne}from"../../../common/iconLabels.js";import{KeyCode as h}from"../../../common/keyCodes.js";import"../../../common/keybindings.js";import{DisposableStore as ie}from"../../../common/lifecycle.js";import{isLinux as $,isMacintosh as oe}from"../../../common/platform.js";import{ScrollbarVisibility as z}from"../../../common/scrollable.js";import*as L from"../../../common/strings.js";const D=/\(&([^\s&])\)|(^|[^&])&([^\s&])/,T=/(&amp;)?(&amp;)([^\s&])/g;var se=(e=>(e[e.Right=0]="Right",e[e.Left=1]="Left",e))(se||{}),ae=(e=>(e[e.Above=0]="Above",e[e.Below=1]="Below",e))(ae||{});const Ue={shadowColor:void 0,borderColor:void 0,foregroundColor:void 0,backgroundColor:void 0,selectionForegroundColor:void 0,selectionBackgroundColor:void 0,selectionBorderColor:void 0,separatorColor:void 0,scrollbarShadow:void 0,scrollbarSliderBackground:void 0,scrollbarSliderHoverBackground:void 0,scrollbarSliderActiveBackground:void 0};class S extends G{constructor(e,t,n,s){e.classList.add("monaco-menu-container"),e.setAttribute("role","presentation");const i=document.createElement("div");i.classList.add("monaco-menu"),i.setAttribute("role","presentation");super(i,{orientation:j.VERTICAL,actionViewItemProvider:a=>this.doGetActionViewItem(a,n,r),context:n.context,actionRunner:n.actionRunner,ariaLabel:n.ariaLabel,ariaRole:"menu",focusOnlyEnabledItems:!0,triggerKeys:{keys:[h.Enter,...oe||$?[h.Space]:[]],keyDown:!0}});this.menuStyles=s;this.menuElement=i,this.actionsList.tabIndex=0,this.initializeOrUpdateStyleSheet(e,s),this._register(R.addTarget(i)),this._register(l(i,u.KEY_DOWN,a=>{new v(a).equals(h.Tab)&&a.preventDefault()})),n.enableMnemonics&&this._register(l(i,u.KEY_DOWN,a=>{const o=a.key.toLocaleLowerCase();if(this.mnemonics.has(o)){p.stop(a,!0);const c=this.mnemonics.get(o);if(c.length===1&&(c[0]instanceof B&&c[0].container&&this.focusItemByElement(c[0].container),c[0].onClick(a)),c.length>1){const y=c.shift();y&&y.container&&(this.focusItemByElement(y.container),c.push(y)),this.mnemonics.set(o,c)}}})),$&&this._register(l(i,u.KEY_DOWN,a=>{const o=new v(a);o.equals(h.Home)||o.equals(h.PageUp)?(this.focusedItem=this.viewItems.length-1,this.focusNext(),p.stop(a,!0)):(o.equals(h.End)||o.equals(h.PageDown))&&(this.focusedItem=0,this.focusPrevious(),p.stop(a,!0))})),this._register(l(this.domNode,u.MOUSE_OUT,a=>{const o=a.relatedTarget;x(o,this.domNode)||(this.focusedItem=void 0,this.updateFocus(),a.stopPropagation())})),this._register(l(this.actionsList,u.MOUSE_OVER,a=>{let o=a.target;if(!(!o||!x(o,this.actionsList)||o===this.actionsList)){for(;o.parentElement!==this.actionsList&&o.parentElement!==null;)o=o.parentElement;if(o.classList.contains("action-item")){const c=this.focusedItem;this.setFocusedItem(o),c!==this.focusedItem&&this.updateFocus()}}})),this._register(R.addTarget(this.actionsList)),this._register(l(this.actionsList,_.Tap,a=>{let o=a.initialTarget;if(!(!o||!x(o,this.actionsList)||o===this.actionsList)){for(;o.parentElement!==this.actionsList&&o.parentElement!==null;)o=o.parentElement;if(o.classList.contains("action-item")){const c=this.focusedItem;this.setFocusedItem(o),c!==this.focusedItem&&this.updateFocus()}}}));const r={parent:this};this.mnemonics=new Map,this.scrollableElement=this._register(new Q(i,{alwaysConsumeMouseWheel:!0,horizontal:z.Hidden,vertical:z.Visible,verticalScrollbarSize:7,handleMouseWheel:!0,useShadows:!0}));const m=this.scrollableElement.getDomNode();m.style.position="",this.styleScrollElement(m,s),this._register(l(i,_.Change,a=>{p.stop(a,!0);const o=this.scrollableElement.getScrollPosition().scrollTop;this.scrollableElement.setScrollPosition({scrollTop:o-a.translationY})})),this._register(l(m,u.MOUSE_UP,a=>{a.preventDefault()}));const C=w(e);i.style.maxHeight=`${Math.max(10,C.innerHeight-e.getBoundingClientRect().top-35)}px`,t=t.filter((a,o)=>!(n.submenuIds?.has(a.id)||a instanceof E&&(o===t.length-1||o===0||t[o-1]instanceof E))),this.push(t,{icon:!0,label:!0,isMenu:!0}),e.appendChild(this.scrollableElement.getDomNode()),this.scrollableElement.scanDomNode(),this.viewItems.filter(a=>!(a instanceof P)).forEach((a,o,c)=>{a.updatePositionInSet(o+1,c.length)})}mnemonics;scrollableElement;menuElement;static globalStyleSheet;styleSheet;initializeOrUpdateStyleSheet(e,t){this.styleSheet||(N(e)?this.styleSheet=V(e):(S.globalStyleSheet||(S.globalStyleSheet=V()),this.styleSheet=S.globalStyleSheet)),this.styleSheet.textContent=ce(t,N(e))}styleScrollElement(e,t){const n=t.foregroundColor??"",s=t.backgroundColor??"",i=t.borderColor?`1px solid ${t.borderColor}`:"",r="5px",m=t.shadowColor?`0 2px 8px ${t.shadowColor}`:"";e.style.outline=i,e.style.borderRadius=r,e.style.color=n,e.style.backgroundColor=s,e.style.boxShadow=m}getContainer(){return this.scrollableElement.getDomNode()}get onScroll(){return this.scrollableElement.onScroll}get scrollOffset(){return this.menuElement.scrollTop}trigger(e){if(e<=this.viewItems.length&&e>=0){const t=this.viewItems[e];if(t instanceof B)super.focus(e),t.open(!0);else if(t instanceof O)super.run(t._action,t._context);else return}}focusItemByElement(e){const t=this.focusedItem;this.setFocusedItem(e),t!==this.focusedItem&&this.updateFocus()}setFocusedItem(e){for(let t=0;t<this.actionsList.children.length;t++){const n=this.actionsList.children[t];if(e===n){this.focusedItem=t;break}}}updateFocus(e){super.updateFocus(e,!0,!0),typeof this.focusedItem<"u"&&this.scrollableElement.setScrollPosition({scrollTop:Math.round(this.menuElement.scrollTop)})}doGetActionViewItem(e,t,n){if(e instanceof E)return new P(t.context,e,{icon:!0},this.menuStyles);if(e instanceof ee){const s=new B(e,e.actions,n,{...t,submenuIds:new Set([...t.submenuIds||[],e.id])},this.menuStyles);if(t.enableMnemonics){const i=s.getMnemonic();if(i&&s.isEnabled()){let r=[];this.mnemonics.has(i)&&(r=this.mnemonics.get(i)),r.push(s),this.mnemonics.set(i,r)}}return s}else{const s={enableMnemonics:t.enableMnemonics,useEventAsContext:t.useEventAsContext};if(t.getKeyBinding){const r=t.getKeyBinding(e);if(r){const m=r.getLabel();m&&(s.keybinding=m)}}const i=new O(t.context,e,s,this.menuStyles);if(t.enableMnemonics){const r=i.getMnemonic();if(r&&i.isEnabled()){let m=[];this.mnemonics.has(r)&&(m=this.mnemonics.get(r)),m.push(i),this.mnemonics.set(r,m)}}return i}}}class O extends J{constructor(e,t,n,s){n.isMenu=!0;super(t,t,n);this.menuStyle=s;if(this.options=n,this.options.icon=n.icon!==void 0?n.icon:!1,this.options.label=n.label!==void 0?n.label:!0,this.cssClass="",this.options.label&&n.enableMnemonics){const i=this.action.label;if(i){const r=D.exec(i);r&&(this.mnemonic=(r[1]?r[1]:r[3]).toLocaleLowerCase())}}this.runOnceToEnableMouseUp=new A(()=>{this.element&&(this._register(l(this.element,u.MOUSE_UP,i=>{if(p.stop(i,!0),q){if(new Y(w(this.element),i).rightButton)return;this.onClick(i)}else setTimeout(()=>{this.onClick(i)},0)})),this._register(l(this.element,u.CONTEXT_MENU,i=>{p.stop(i,!0)})))},100),this._register(this.runOnceToEnableMouseUp)}container;options;item;runOnceToEnableMouseUp;label;check;mnemonic;cssClass;render(e){super.render(e),this.element&&(this.container=e,this.item=g(this.element,f("a.action-menu-item")),this._action.id===E.ID?this.item.setAttribute("role","presentation"):(this.item.setAttribute("role","menuitem"),this.mnemonic&&this.item.setAttribute("aria-keyshortcuts",`${this.mnemonic}`)),this.check=g(this.item,f("span.menu-item-check"+U.asCSSSelector(I.menuSelection))),this.check.setAttribute("role","none"),this.label=g(this.item,f("span.action-label")),this.options.label&&this.options.keybinding&&(g(this.item,f("span.keybinding")).textContent=this.options.keybinding),this.runOnceToEnableMouseUp.schedule(),this.updateClass(),this.updateLabel(),this.updateTooltip(),this.updateEnabled(),this.updateChecked(),this.applyStyle())}blur(){super.blur(),this.applyStyle()}focus(){super.focus(),this.item?.focus(),this.applyStyle()}updatePositionInSet(e,t){this.item&&(this.item.setAttribute("aria-posinset",`${e}`),this.item.setAttribute("aria-setsize",`${t}`))}updateLabel(){if(this.label&&this.options.label){W(this.label);let e=ne(this.action.label);if(e){const t=re(e);this.options.enableMnemonics||(e=t),this.label.setAttribute("aria-label",t.replace(/&&/g,"&"));const n=D.exec(e);if(n){e=L.escape(e),T.lastIndex=0;let s=T.exec(e);for(;s&&s[1];)s=T.exec(e);const i=r=>r.replace(/&amp;&amp;/g,"&amp;");s?this.label.append(L.ltrim(i(e.substr(0,s.index))," "),f("u",{"aria-hidden":"true"},s[3]),L.rtrim(i(e.substr(s.index+s[0].length))," ")):this.label.innerText=i(e).trim(),this.item?.setAttribute("aria-keyshortcuts",(n[1]?n[1]:n[3]).toLocaleLowerCase())}else this.label.innerText=e.replace(/&&/g,"&").trim()}}}updateTooltip(){}updateClass(){this.cssClass&&this.item&&this.item.classList.remove(...this.cssClass.split(" ")),this.options.icon&&this.label?(this.cssClass=this.action.class||"",this.label.classList.add("icon"),this.cssClass&&this.label.classList.add(...this.cssClass.split(" ")),this.updateEnabled()):this.label&&this.label.classList.remove("icon")}updateEnabled(){this.action.enabled?(this.element&&(this.element.classList.remove("disabled"),this.element.removeAttribute("aria-disabled")),this.item&&(this.item.classList.remove("disabled"),this.item.removeAttribute("aria-disabled"),this.item.tabIndex=0)):(this.element&&(this.element.classList.add("disabled"),this.element.setAttribute("aria-disabled","true")),this.item&&(this.item.classList.add("disabled"),this.item.setAttribute("aria-disabled","true")))}updateChecked(){if(!this.item)return;const e=this.action.checked;this.item.classList.toggle("checked",!!e),e!==void 0?(this.item.setAttribute("role","menuitemcheckbox"),this.item.setAttribute("aria-checked",e?"true":"false")):(this.item.setAttribute("role","menuitem"),this.item.setAttribute("aria-checked",""))}getMnemonic(){return this.mnemonic}applyStyle(){const e=this.element&&this.element.classList.contains("focused"),t=e&&this.menuStyle.selectionForegroundColor?this.menuStyle.selectionForegroundColor:this.menuStyle.foregroundColor,n=e&&this.menuStyle.selectionBackgroundColor?this.menuStyle.selectionBackgroundColor:void 0,s=e&&this.menuStyle.selectionBorderColor?`1px solid ${this.menuStyle.selectionBorderColor}`:"",i=e&&this.menuStyle.selectionBorderColor?"-1px":"";this.item&&(this.item.style.color=t??"",this.item.style.backgroundColor=n??"",this.item.style.outline=s,this.item.style.outlineOffset=i),this.check&&(this.check.style.color=t??"")}}class B extends O{constructor(e,t,n,s,i){super(e,e,s,i);this.submenuActions=t;this.parentData=n;this.submenuOptions=s;this.expandDirection=s&&s.expandDirection!==void 0?s.expandDirection:{horizontal:0,vertical:1},this.showScheduler=new A(()=>{this.mouseOver&&(this.cleanupExistingSubmenu(!1),this.createSubmenu(!1))},250),this.hideScheduler=new A(()=>{this.element&&!x(M(),this.element)&&this.parentData.submenu===this.mysubmenu&&(this.parentData.parent.focus(!1),this.cleanupExistingSubmenu(!0))},750)}mysubmenu=null;submenuContainer;submenuIndicator;submenuDisposables=this._register(new ie);mouseOver=!1;showScheduler;hideScheduler;expandDirection;render(e){super.render(e),this.element&&(this.item&&(this.item.classList.add("monaco-submenu-item"),this.item.tabIndex=0,this.item.setAttribute("aria-haspopup","true"),this.updateAriaExpanded("false"),this.submenuIndicator=g(this.item,f("span.submenu-indicator"+U.asCSSSelector(I.menuSubmenu))),this.submenuIndicator.setAttribute("aria-hidden","true")),this._register(l(this.element,u.KEY_UP,t=>{const n=new v(t);(n.equals(h.RightArrow)||n.equals(h.Enter))&&(p.stop(t,!0),this.createSubmenu(!0))})),this._register(l(this.element,u.KEY_DOWN,t=>{const n=new v(t);M()===this.item&&(n.equals(h.RightArrow)||n.equals(h.Enter))&&p.stop(t,!0)})),this._register(l(this.element,u.MOUSE_OVER,t=>{this.mouseOver||(this.mouseOver=!0,this.showScheduler.schedule())})),this._register(l(this.element,u.MOUSE_LEAVE,t=>{this.mouseOver=!1})),this._register(l(this.element,u.FOCUS_OUT,t=>{this.element&&!x(M(),this.element)&&this.hideScheduler.schedule()})),this._register(this.parentData.parent.onScroll(()=>{this.parentData.submenu===this.mysubmenu&&(this.parentData.parent.focus(!1),this.cleanupExistingSubmenu(!0))})))}updateEnabled(){}open(e){this.cleanupExistingSubmenu(!1),this.createSubmenu(e)}onClick(e){p.stop(e,!0),this.cleanupExistingSubmenu(!1),this.createSubmenu(!0)}cleanupExistingSubmenu(e){if(this.parentData.submenu&&(e||this.parentData.submenu!==this.mysubmenu)){try{this.parentData.submenu.dispose()}catch{}this.parentData.submenu=void 0,this.updateAriaExpanded("false"),this.submenuContainer&&(this.submenuDisposables.clear(),this.submenuContainer=void 0)}}calculateSubmenuMenuLayout(e,t,n,s){const i={top:0,left:0};return i.left=F(e.width,t.width,{position:s.horizontal===0?k.Before:k.After,offset:n.left,size:n.width}),i.left>=n.left&&i.left<n.left+n.width&&(n.left+10+t.width<=e.width&&(i.left=n.left+10),n.top+=10,n.height=0),i.top=F(e.height,t.height,{position:k.Before,offset:n.top,size:0}),i.top+t.height===n.top&&i.top+n.height+t.height<=e.height&&(i.top+=n.height),i}createSubmenu(e=!0){if(this.element)if(this.parentData.submenu)this.parentData.submenu.focus(!1);else{this.updateAriaExpanded("true"),this.submenuContainer=g(this.element,f("div.monaco-submenu")),this.submenuContainer.classList.add("menubar-menu-items-holder","context-view");const t=w(this.parentData.parent.domNode).getComputedStyle(this.parentData.parent.domNode),n=parseFloat(t.paddingTop||"0")||0;this.submenuContainer.style.zIndex="1",this.submenuContainer.style.position="fixed",this.submenuContainer.style.top="0",this.submenuContainer.style.left="0",this.parentData.submenu=new S(this.submenuContainer,this.submenuActions.length?this.submenuActions:[new Z],this.submenuOptions,this.menuStyle);const s=this.element.getBoundingClientRect(),i={top:s.top-n,left:s.left,height:s.height+2*n,width:s.width},r=this.submenuContainer.getBoundingClientRect(),m=w(this.element),{top:C,left:a}=this.calculateSubmenuMenuLayout(new H(m.innerWidth,m.innerHeight),H.lift(r),i,this.expandDirection);this.submenuContainer.style.left=`${a-r.left}px`,this.submenuContainer.style.top=`${C-r.top}px`,this.submenuDisposables.add(l(this.submenuContainer,u.KEY_UP,o=>{new v(o).equals(h.LeftArrow)&&(p.stop(o,!0),this.parentData.parent.focus(),this.cleanupExistingSubmenu(!0))})),this.submenuDisposables.add(l(this.submenuContainer,u.KEY_DOWN,o=>{new v(o).equals(h.LeftArrow)&&p.stop(o,!0)})),this.submenuDisposables.add(this.parentData.submenu.onDidCancel(()=>{this.parentData.parent.focus(),this.cleanupExistingSubmenu(!0)})),this.parentData.submenu.focus(e),this.mysubmenu=this.parentData.submenu}}updateAriaExpanded(e){this.item&&this.item?.setAttribute("aria-expanded",e)}applyStyle(){super.applyStyle();const t=this.element&&this.element.classList.contains("focused")&&this.menuStyle.selectionForegroundColor?this.menuStyle.selectionForegroundColor:this.menuStyle.foregroundColor;this.submenuIndicator&&(this.submenuIndicator.style.color=t??"")}dispose(){super.dispose(),this.hideScheduler.dispose(),this.mysubmenu&&(this.mysubmenu.dispose(),this.mysubmenu=null),this.submenuContainer&&(this.submenuContainer=void 0)}}class P extends X{constructor(e,t,n,s){super(e,t,n);this.menuStyles=s}render(e){super.render(e),this.label&&(this.label.style.borderBottomColor=this.menuStyles.separatorColor?`${this.menuStyles.separatorColor}`:"")}}function re(d){const b=D,e=b.exec(d);if(!e)return d;const t=!e[1];return d.replace(b,t?"$2$3":"").trim()}function K(d){const b=te()[d.id];return`.codicon-${d.id}:before { content: '\\${b.toString(16)}'; }`}function ce(d,b){let e=`
.monaco-menu {
	font-size: 13px;
	border-radius: 5px;
	min-width: 160px;
}

${K(I.menuSelection)}
${K(I.menuSubmenu)}

.monaco-menu .monaco-action-bar {
	text-align: right;
	overflow: hidden;
	white-space: nowrap;
}

.monaco-menu .monaco-action-bar .actions-container {
	display: flex;
	margin: 0 auto;
	padding: 0;
	width: 100%;
	justify-content: flex-end;
}

.monaco-menu .monaco-action-bar.vertical .actions-container {
	display: inline-block;
}

.monaco-menu .monaco-action-bar.reverse .actions-container {
	flex-direction: row-reverse;
}

.monaco-menu .monaco-action-bar .action-item {
	cursor: pointer;
	display: inline-block;
	transition: transform 50ms ease;
	position: relative;  /* DO NOT REMOVE - this is the key to preventing the ghosting icon bug in Chrome 42 */
}

.monaco-menu .monaco-action-bar .action-item.disabled {
	cursor: default;
}

.monaco-menu .monaco-action-bar .action-item .icon,
.monaco-menu .monaco-action-bar .action-item .codicon {
	display: inline-block;
}

.monaco-menu .monaco-action-bar .action-item .codicon {
	display: flex;
	align-items: center;
}

.monaco-menu .monaco-action-bar .action-label {
	font-size: 11px;
	margin-right: 4px;
}

.monaco-menu .monaco-action-bar .action-item.disabled .action-label,
.monaco-menu .monaco-action-bar .action-item.disabled .action-label:hover {
	color: var(--vscode-disabledForeground);
}

/* Vertical actions */

.monaco-menu .monaco-action-bar.vertical {
	text-align: left;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	display: block;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	display: block;
	border-bottom: 1px solid var(--vscode-menu-separatorBackground);
	padding-top: 1px;
	padding: 30px;
}

.monaco-menu .secondary-actions .monaco-action-bar .action-label {
	margin-left: 6px;
}

/* Action Items */
.monaco-menu .monaco-action-bar .action-item.select-container {
	overflow: hidden; /* somehow the dropdown overflows its container, we prevent it here to not push */
	flex: 1;
	max-width: 170px;
	min-width: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
}

.monaco-menu .monaco-action-bar.vertical {
	margin-left: 0;
	overflow: visible;
}

.monaco-menu .monaco-action-bar.vertical .actions-container {
	display: block;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	padding: 0;
	transform: none;
	display: flex;
}

.monaco-menu .monaco-action-bar.vertical .action-item.active {
	transform: none;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item {
	flex: 1 1 auto;
	display: flex;
	height: 2em;
	align-items: center;
	position: relative;
	margin: 0 4px;
	border-radius: 4px;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item:hover .keybinding,
.monaco-menu .monaco-action-bar.vertical .action-menu-item:focus .keybinding {
	opacity: unset;
}

.monaco-menu .monaco-action-bar.vertical .action-label {
	flex: 1 1 auto;
	text-decoration: none;
	padding: 0 1em;
	background: none;
	font-size: 12px;
	line-height: 1;
}

.monaco-menu .monaco-action-bar.vertical .keybinding,
.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	display: inline-block;
	flex: 2 1 auto;
	padding: 0 1em;
	text-align: right;
	font-size: 12px;
	line-height: 1;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator.codicon {
	font-size: 16px !important;
	display: flex;
	align-items: center;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator.codicon::before {
	margin-left: auto;
	margin-right: -20px;
}

.monaco-menu .monaco-action-bar.vertical .action-item.disabled .keybinding,
.monaco-menu .monaco-action-bar.vertical .action-item.disabled .submenu-indicator {
	opacity: 0.4;
}

.monaco-menu .monaco-action-bar.vertical .action-label:not(.separator) {
	display: inline-block;
	box-sizing: border-box;
	margin: 0;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	position: static;
	overflow: visible;
}

.monaco-menu .monaco-action-bar.vertical .action-item .monaco-submenu {
	position: absolute;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	width: 100%;
	height: 0px !important;
	opacity: 1;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator.text {
	padding: 0.7em 1em 0.1em 1em;
	font-weight: bold;
	opacity: 1;
}

.monaco-menu .monaco-action-bar.vertical .action-label:hover {
	color: inherit;
}

.monaco-menu .monaco-action-bar.vertical .menu-item-check {
	position: absolute;
	visibility: hidden;
	width: 1em;
	height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item.checked .menu-item-check {
	visibility: visible;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* Context Menu */

.context-view.monaco-menu-container {
	outline: 0;
	border: none;
	animation: fadeIn 0.083s linear;
	-webkit-app-region: no-drag;
}

.context-view.monaco-menu-container :focus,
.context-view.monaco-menu-container .monaco-action-bar.vertical:focus,
.context-view.monaco-menu-container .monaco-action-bar.vertical :focus {
	outline: 0;
}

.hc-black .context-view.monaco-menu-container,
.hc-light .context-view.monaco-menu-container,
:host-context(.hc-black) .context-view.monaco-menu-container,
:host-context(.hc-light) .context-view.monaco-menu-container {
	box-shadow: none;
}

.hc-black .monaco-menu .monaco-action-bar.vertical .action-item.focused,
.hc-light .monaco-menu .monaco-action-bar.vertical .action-item.focused,
:host-context(.hc-black) .monaco-menu .monaco-action-bar.vertical .action-item.focused,
:host-context(.hc-light) .monaco-menu .monaco-action-bar.vertical .action-item.focused {
	background: none;
}

/* Vertical Action Bar Styles */

.monaco-menu .monaco-action-bar.vertical {
	padding: 4px 0;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item {
	height: 2em;
}

.monaco-menu .monaco-action-bar.vertical .action-label:not(.separator),
.monaco-menu .monaco-action-bar.vertical .keybinding {
	font-size: inherit;
	padding: 0 2em;
	max-height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .menu-item-check {
	font-size: inherit;
	width: 2em;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	font-size: inherit;
	margin: 5px 0 !important;
	padding: 0;
	border-radius: 0;
}

.linux .monaco-menu .monaco-action-bar.vertical .action-label.separator,
:host-context(.linux) .monaco-menu .monaco-action-bar.vertical .action-label.separator {
	margin-left: 0;
	margin-right: 0;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	font-size: 60%;
	padding: 0 1.8em;
}

.linux .monaco-menu .monaco-action-bar.vertical .submenu-indicator,
:host-context(.linux) .monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	height: 100%;
	mask-size: 10px 10px;
	-webkit-mask-size: 10px 10px;
}

.monaco-menu .action-item {
	cursor: default;
}`;if(b){e+=`
			/* Arrows */
			.monaco-scrollable-element > .scrollbar > .scra {
				cursor: pointer;
				font-size: 11px !important;
			}

			.monaco-scrollable-element > .visible {
				opacity: 1;

				/* Background rule added for IE9 - to allow clicks on dom node */
				background:rgba(0,0,0,0);

				transition: opacity 100ms linear;
			}
			.monaco-scrollable-element > .invisible {
				opacity: 0;
				pointer-events: none;
			}
			.monaco-scrollable-element > .invisible.fade {
				transition: opacity 800ms linear;
			}

			/* Scrollable Content Inset Shadow */
			.monaco-scrollable-element > .shadow {
				position: absolute;
				display: none;
			}
			.monaco-scrollable-element > .shadow.top {
				display: block;
				top: 0;
				left: 3px;
				height: 3px;
				width: 100%;
			}
			.monaco-scrollable-element > .shadow.left {
				display: block;
				top: 3px;
				left: 0;
				height: 100%;
				width: 3px;
			}
			.monaco-scrollable-element > .shadow.top-left-corner {
				display: block;
				top: 0;
				left: 0;
				height: 3px;
				width: 3px;
			}
		`;const t=d.scrollbarShadow;t&&(e+=`
				.monaco-scrollable-element > .shadow.top {
					box-shadow: ${t} 0 6px 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.left {
					box-shadow: ${t} 6px 0 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.top.left {
					box-shadow: ${t} 6px 6px 6px -6px inset;
				}
			`);const n=d.scrollbarSliderBackground;n&&(e+=`
				.monaco-scrollable-element > .scrollbar > .slider {
					background: ${n};
				}
			`);const s=d.scrollbarSliderHoverBackground;s&&(e+=`
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${s};
				}
			`);const i=d.scrollbarSliderActiveBackground;i&&(e+=`
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${i};
				}
			`)}return e}export{se as HorizontalDirection,T as MENU_ESCAPED_MNEMONIC_REGEX,D as MENU_MNEMONIC_REGEX,S as Menu,ae as VerticalDirection,re as cleanMnemonic,K as formatRule,Ue as unthemedMenuStyles};
