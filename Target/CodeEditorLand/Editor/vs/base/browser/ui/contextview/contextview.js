import{BrowserFeatures as S}from"../../canIUse.js";import*as o from"../../dom.js";import"../../mouseEvent.js";import{Disposable as u,DisposableStore as v,toDisposable as A}from"../../../common/lifecycle.js";import*as E from"../../../common/platform.js";import{Range as y}from"../../../common/range.js";import"../../../common/types.js";import"./contextview.css";var x=(i=>(i[i.ABSOLUTE=1]="ABSOLUTE",i[i.FIXED=2]="FIXED",i[i.FIXED_SHADOW=3]="FIXED_SHADOW",i))(x||{});function L(c){const t=c;return!!t&&typeof t.x=="number"&&typeof t.y=="number"}var D=(e=>(e[e.LEFT=0]="LEFT",e[e.RIGHT=1]="RIGHT",e))(D||{}),I=(e=>(e[e.BELOW=0]="BELOW",e[e.ABOVE=1]="ABOVE",e))(I||{}),H=(e=>(e[e.VERTICAL=0]="VERTICAL",e[e.HORIZONTAL=1]="HORIZONTAL",e))(H||{}),O=(e=>(e[e.Before=0]="Before",e[e.After=1]="After",e))(O||{}),b=(e=>(e[e.AVOID=0]="AVOID",e[e.ALIGN=1]="ALIGN",e))(b||{});function m(c,t,e){const i=e.mode===1?e.offset:e.offset+e.size,s=e.mode===1?e.offset+e.size:e.offset;return e.position===0?t<=c-i?i:t<=s?s-t:Math.max(c-t,0):t<=s?s-t:t<=c-i?i:0}class p extends u{static BUBBLE_UP_EVENTS=["click","keydown","focus","blur"];static BUBBLE_DOWN_EVENTS=["click"];container=null;view;useFixedPosition=!1;useShadowDOM=!1;delegate=null;toDisposeOnClean=u.None;toDisposeOnSetContainer=u.None;shadowRoot=null;shadowRootHostElement=null;constructor(t,e){super(),this.view=o.$(".context-view"),o.hide(this.view),this.setContainer(t,e),this._register(A(()=>this.setContainer(null,1)))}setContainer(t,e){this.useFixedPosition=e!==1;const i=this.useShadowDOM;if(this.useShadowDOM=e===3,!(t===this.container&&i===this.useShadowDOM)&&(this.container&&(this.toDisposeOnSetContainer.dispose(),this.view.remove(),this.shadowRoot&&(this.shadowRoot=null,this.shadowRootHostElement?.remove(),this.shadowRootHostElement=null),this.container=null),t)){if(this.container=t,this.useShadowDOM){this.shadowRootHostElement=o.$(".shadow-root-host"),this.container.appendChild(this.shadowRootHostElement),this.shadowRoot=this.shadowRootHostElement.attachShadow({mode:"open"});const a=document.createElement("style");a.textContent=M,this.shadowRoot.appendChild(a),this.shadowRoot.appendChild(this.view),this.shadowRoot.appendChild(o.$("slot"))}else this.container.appendChild(this.view);const s=new v;p.BUBBLE_UP_EVENTS.forEach(a=>{s.add(o.addStandardDisposableListener(this.container,a,l=>{this.onDOMEvent(l,!1)}))}),p.BUBBLE_DOWN_EVENTS.forEach(a=>{s.add(o.addStandardDisposableListener(this.container,a,l=>{this.onDOMEvent(l,!0)},!0))}),this.toDisposeOnSetContainer=s}}show(t){this.isVisible()&&this.hide(),o.clearNode(this.view),this.view.className="context-view monaco-component",this.view.style.top="0px",this.view.style.left="0px",this.view.style.zIndex=`${2575+(t.layer??0)}`,this.view.style.position=this.useFixedPosition?"fixed":"absolute",o.show(this.view),this.toDisposeOnClean=t.render(this.view)||u.None,this.delegate=t,this.doLayout(),this.delegate.focus?.()}getViewElement(){return this.view}layout(){if(this.isVisible()){if(this.delegate.canRelayout===!1&&!(E.isIOS&&S.pointerEvents)){this.hide();return}this.delegate?.layout?.(),this.doLayout()}}doLayout(){if(!this.isVisible())return;const t=this.delegate.getAnchor();let e;if(o.isHTMLElement(t)){const n=o.getDomNodePagePosition(t),r=o.getDomNodeZoomLevel(t);e={top:n.top*r,left:n.left*r,width:n.width*r,height:n.height*r}}else L(t)?e={top:t.y,left:t.x,width:t.width||1,height:t.height||2}:e={top:t.posy,left:t.posx,width:2,height:2};const i=o.getTotalWidth(this.view),s=o.getTotalHeight(this.view),a=this.delegate.anchorPosition||0,l=this.delegate.anchorAlignment||0,w=this.delegate.anchorAxisAlignment||0;let d,f;const h=o.getActiveWindow();if(w===0){const n={offset:e.top-h.pageYOffset,size:e.height,position:a===0?0:1},r={offset:e.left,size:e.width,position:l===0?0:1,mode:1};d=m(h.innerHeight,s,n)+h.pageYOffset,y.intersects({start:d,end:d+s},{start:n.offset,end:n.offset+n.size})&&(r.mode=0),f=m(h.innerWidth,i,r)}else{const n={offset:e.left,size:e.width,position:l===0?0:1},r={offset:e.top,size:e.height,position:a===0?0:1,mode:1};f=m(h.innerWidth,i,n),y.intersects({start:f,end:f+i},{start:n.offset,end:n.offset+n.size})&&(r.mode=0),d=m(h.innerHeight,s,r)+h.pageYOffset}this.view.classList.remove("top","bottom","left","right"),this.view.classList.add(a===0?"bottom":"top"),this.view.classList.add(l===0?"left":"right"),this.view.classList.toggle("fixed",this.useFixedPosition);const g=o.getDomNodePagePosition(this.container);this.view.style.top=`${d-(this.useFixedPosition?o.getDomNodePagePosition(this.view).top:g.top)}px`,this.view.style.left=`${f-(this.useFixedPosition?o.getDomNodePagePosition(this.view).left:g.left)}px`,this.view.style.width="initial"}hide(t){const e=this.delegate;this.delegate=null,e?.onHide&&e.onHide(t),this.toDisposeOnClean.dispose(),o.hide(this.view)}isVisible(){return!!this.delegate}onDOMEvent(t,e){this.delegate&&(this.delegate.onDOMEvent?this.delegate.onDOMEvent(t,o.getWindow(t).document.activeElement):e&&!o.isAncestor(t.target,this.container)&&this.hide())}dispose(){this.hide(),super.dispose()}}const M=`
	:host {
		all: initial; /* 1st rule so subsequent properties are reset. */
	}

	.codicon[class*='codicon-'] {
		font: normal normal normal 16px/1 codicon;
		display: inline-block;
		text-decoration: none;
		text-rendering: auto;
		text-align: center;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

	:host {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "HelveticaNeue-Light", system-ui, "Ubuntu", "Droid Sans", sans-serif;
	}

	:host-context(.mac) { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
	:host-context(.mac:lang(zh-Hans)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif; }
	:host-context(.mac:lang(zh-Hant)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif; }
	:host-context(.mac:lang(ja)) { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic Pro", sans-serif; }
	:host-context(.mac:lang(ko)) { font-family: -apple-system, BlinkMacSystemFont, "Nanum Gothic", "Apple SD Gothic Neo", "AppleGothic", sans-serif; }

	:host-context(.windows) { font-family: "Segoe WPC", "Segoe UI", sans-serif; }
	:host-context(.windows:lang(zh-Hans)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif; }
	:host-context(.windows:lang(zh-Hant)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft Jhenghei", sans-serif; }
	:host-context(.windows:lang(ja)) { font-family: "Segoe WPC", "Segoe UI", "Yu Gothic UI", "Meiryo UI", sans-serif; }
	:host-context(.windows:lang(ko)) { font-family: "Segoe WPC", "Segoe UI", "Malgun Gothic", "Dotom", sans-serif; }

	:host-context(.linux) { font-family: system-ui, "Ubuntu", "Droid Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hans)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans SC", "Source Han Sans CN", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hant)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans TC", "Source Han Sans TW", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ja)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans J", "Source Han Sans JP", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ko)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans K", "Source Han Sans JR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim", sans-serif; }
`;export{D as AnchorAlignment,H as AnchorAxisAlignment,I as AnchorPosition,p as ContextView,x as ContextViewDOMPosition,b as LayoutAnchorMode,O as LayoutAnchorPosition,L as isAnchor,m as layout};
