import{$ as x}from"../../dom.js";import{Orientation as d}from"../sash/sash.js";import{LayoutPriority as z,Sizing as O,SplitView as D}from"../splitview/splitview.js";import{equals as H,tail2 as w}from"../../../common/arrays.js";import{Color as R}from"../../../common/color.js";import{Emitter as N,Event as p,Relay as C}from"../../../common/event.js";import{Disposable as y,DisposableStore as _,toDisposable as k}from"../../../common/lifecycle.js";import{rot as G}from"../../../common/numbers.js";import{isUndefined as B}from"../../../common/types.js";import"./gridview.css";import{Orientation as de}from"../sash/sash.js";import{LayoutPriority as ue,Sizing as me}from"../splitview/splitview.js";const W={separatorBorder:R.transparent};function V(s){return s===d.VERTICAL?d.HORIZONTAL:d.VERTICAL}function se(s){return!!s.children}class T{constructor(e){this.isLayoutEnabled=e}}function M(s,e){return e===d.HORIZONTAL?{left:s.start,right:s.end,top:s.orthogonalStart,bottom:s.orthogonalEnd}:{top:s.start,bottom:s.end,left:s.orthogonalStart,right:s.orthogonalEnd}}function A(s,e){return e===d.HORIZONTAL?{start:s.left,end:s.right,orthogonalStart:s.top,orthogonalEnd:s.bottom}:{start:s.top,end:s.bottom,orthogonalStart:s.left,orthogonalEnd:s.right}}function v(s,e){if(Math.abs(s)>e)throw new Error("Invalid index");return G(s,e+1)}class l{constructor(e,i,t,n,o=0,r=0,a=!1,h){this.orientation=e;this.layoutController=i;this.splitviewProportionalLayout=n;if(this._styles=t,this._size=o,this._orthogonalSize=r,this.element=x(".monaco-grid-branch-node"),!h)this.splitview=new D(this.element,{orientation:e,styles:t,proportionalLayout:n}),this.splitview.layout(o,{orthogonalSize:r,absoluteOffset:0,absoluteOrthogonalOffset:0,absoluteSize:o,absoluteOrthogonalSize:r});else{const b={views:h.map(f=>({view:f.node,size:f.node.size,visible:f.visible!==!1})),size:this.orthogonalSize},c={proportionalLayout:n,orientation:e,styles:t};this.children=h.map(f=>f.node),this.splitview=new D(this.element,{...c,descriptor:b}),this.children.forEach((f,u)=>{const S=u===0,I=u===this.children.length;f.boundarySashes={start:this.boundarySashes.orthogonalStart,end:this.boundarySashes.orthogonalEnd,orthogonalStart:S?this.boundarySashes.start:this.splitview.sashes[u-1],orthogonalEnd:I?this.boundarySashes.end:this.splitview.sashes[u]}})}const g=p.map(this.splitview.onDidSashReset,b=>[b]);this.splitviewSashResetDisposable=g(this._onDidSashReset.fire,this._onDidSashReset),this.updateChildrenEvents()}element;children=[];splitview;_size;get size(){return this._size}_orthogonalSize;get orthogonalSize(){return this._orthogonalSize}_absoluteOffset=0;get absoluteOffset(){return this._absoluteOffset}_absoluteOrthogonalOffset=0;get absoluteOrthogonalOffset(){return this._absoluteOrthogonalOffset}absoluteOrthogonalSize=0;_styles;get styles(){return this._styles}get width(){return this.orientation===d.HORIZONTAL?this.size:this.orthogonalSize}get height(){return this.orientation===d.HORIZONTAL?this.orthogonalSize:this.size}get top(){return this.orientation===d.HORIZONTAL?this._absoluteOffset:this._absoluteOrthogonalOffset}get left(){return this.orientation===d.HORIZONTAL?this._absoluteOrthogonalOffset:this._absoluteOffset}get minimumSize(){return this.children.length===0?0:Math.max(...this.children.map((e,i)=>this.splitview.isViewVisible(i)?e.minimumOrthogonalSize:0))}get maximumSize(){return Math.min(...this.children.map((e,i)=>this.splitview.isViewVisible(i)?e.maximumOrthogonalSize:Number.POSITIVE_INFINITY))}get priority(){if(this.children.length===0)return z.Normal;const e=this.children.map(i=>typeof i.priority>"u"?z.Normal:i.priority);return e.some(i=>i===z.High)?z.High:e.some(i=>i===z.Low)?z.Low:z.Normal}get proportionalLayout(){return this.children.length===0?!0:this.children.every(e=>e.proportionalLayout)}get minimumOrthogonalSize(){return this.splitview.minimumSize}get maximumOrthogonalSize(){return this.splitview.maximumSize}get minimumWidth(){return this.orientation===d.HORIZONTAL?this.minimumOrthogonalSize:this.minimumSize}get minimumHeight(){return this.orientation===d.HORIZONTAL?this.minimumSize:this.minimumOrthogonalSize}get maximumWidth(){return this.orientation===d.HORIZONTAL?this.maximumOrthogonalSize:this.maximumSize}get maximumHeight(){return this.orientation===d.HORIZONTAL?this.maximumSize:this.maximumOrthogonalSize}_onDidChange=new N;onDidChange=this._onDidChange.event;_onDidVisibilityChange=new N;onDidVisibilityChange=this._onDidVisibilityChange.event;childrenVisibilityChangeDisposable=new _;_onDidScroll=new N;onDidScrollDisposable=y.None;onDidScroll=this._onDidScroll.event;childrenChangeDisposable=y.None;_onDidSashReset=new N;onDidSashReset=this._onDidSashReset.event;splitviewSashResetDisposable=y.None;childrenSashResetDisposable=y.None;_boundarySashes={};get boundarySashes(){return this._boundarySashes}set boundarySashes(e){if(!(this._boundarySashes.start===e.start&&this._boundarySashes.end===e.end&&this._boundarySashes.orthogonalStart===e.orthogonalStart&&this._boundarySashes.orthogonalEnd===e.orthogonalEnd)){this._boundarySashes=e,this.splitview.orthogonalStartSash=e.orthogonalStart,this.splitview.orthogonalEndSash=e.orthogonalEnd;for(let i=0;i<this.children.length;i++){const t=this.children[i],n=i===0,o=i===this.children.length-1;t.boundarySashes={start:e.orthogonalStart,end:e.orthogonalEnd,orthogonalStart:n?e.start:t.boundarySashes.orthogonalStart,orthogonalEnd:o?e.end:t.boundarySashes.orthogonalEnd}}}}_edgeSnapping=!1;get edgeSnapping(){return this._edgeSnapping}set edgeSnapping(e){if(this._edgeSnapping!==e){this._edgeSnapping=e;for(const i of this.children)i instanceof l&&(i.edgeSnapping=e);this.updateSplitviewEdgeSnappingEnablement()}}style(e){this._styles=e,this.splitview.style(e);for(const i of this.children)i instanceof l&&i.style(e)}layout(e,i,t){if(this.layoutController.isLayoutEnabled){if(typeof t>"u")throw new Error("Invalid state");this._size=t.orthogonalSize,this._orthogonalSize=e,this._absoluteOffset=t.absoluteOffset+i,this._absoluteOrthogonalOffset=t.absoluteOrthogonalOffset,this.absoluteOrthogonalSize=t.absoluteOrthogonalSize,this.splitview.layout(t.orthogonalSize,{orthogonalSize:e,absoluteOffset:this._absoluteOrthogonalOffset,absoluteOrthogonalOffset:this._absoluteOffset,absoluteSize:t.absoluteOrthogonalSize,absoluteOrthogonalSize:t.absoluteSize}),this.updateSplitviewEdgeSnappingEnablement()}}setVisible(e){for(const i of this.children)i.setVisible(e)}addChild(e,i,t,n){t=v(t,this.children.length),this.splitview.addView(e,i,t,n),this.children.splice(t,0,e),this.updateBoundarySashes(),this.onDidChildrenChange()}removeChild(e,i){e=v(e,this.children.length);const t=this.splitview.removeView(e,i);return this.children.splice(e,1),this.updateBoundarySashes(),this.onDidChildrenChange(),t}removeAllChildren(){const e=this.splitview.removeAllViews();return this.children.splice(0,this.children.length),this.updateBoundarySashes(),this.onDidChildrenChange(),e}moveChild(e,i){e=v(e,this.children.length),i=v(i,this.children.length),e!==i&&(e<i&&(i-=1),this.splitview.moveView(e,i),this.children.splice(i,0,this.children.splice(e,1)[0]),this.updateBoundarySashes(),this.onDidChildrenChange())}swapChildren(e,i){e=v(e,this.children.length),i=v(i,this.children.length),e!==i&&(this.splitview.swapViews(e,i),[this.children[e].boundarySashes,this.children[i].boundarySashes]=[this.children[e].boundarySashes,this.children[i].boundarySashes],[this.children[e],this.children[i]]=[this.children[i],this.children[e]],this.onDidChildrenChange())}resizeChild(e,i){e=v(e,this.children.length),this.splitview.resizeView(e,i)}isChildExpanded(e){return this.splitview.isViewExpanded(e)}distributeViewSizes(e=!1){if(this.splitview.distributeViewSizes(),e)for(const i of this.children)i instanceof l&&i.distributeViewSizes(!0)}getChildSize(e){return e=v(e,this.children.length),this.splitview.getViewSize(e)}isChildVisible(e){return e=v(e,this.children.length),this.splitview.isViewVisible(e)}setChildVisible(e,i){if(e=v(e,this.children.length),this.splitview.isViewVisible(e)===i)return;const t=this.splitview.contentSize===0;this.splitview.setViewVisible(e,i);const n=this.splitview.contentSize===0;(i&&t||!i&&n)&&this._onDidVisibilityChange.fire(i)}getChildCachedVisibleSize(e){return e=v(e,this.children.length),this.splitview.getViewCachedVisibleSize(e)}updateBoundarySashes(){for(let e=0;e<this.children.length;e++)this.children[e].boundarySashes={start:this.boundarySashes.orthogonalStart,end:this.boundarySashes.orthogonalEnd,orthogonalStart:e===0?this.boundarySashes.start:this.splitview.sashes[e-1],orthogonalEnd:e===this.children.length-1?this.boundarySashes.end:this.splitview.sashes[e]}}onDidChildrenChange(){this.updateChildrenEvents(),this._onDidChange.fire(void 0)}updateChildrenEvents(){const e=p.map(p.any(...this.children.map(n=>n.onDidChange)),()=>{});this.childrenChangeDisposable.dispose(),this.childrenChangeDisposable=e(this._onDidChange.fire,this._onDidChange);const i=p.any(...this.children.map((n,o)=>p.map(n.onDidSashReset,r=>[o,...r])));this.childrenSashResetDisposable.dispose(),this.childrenSashResetDisposable=i(this._onDidSashReset.fire,this._onDidSashReset);const t=p.any(p.signal(this.splitview.onDidScroll),...this.children.map(n=>n.onDidScroll));this.onDidScrollDisposable.dispose(),this.onDidScrollDisposable=t(this._onDidScroll.fire,this._onDidScroll),this.childrenVisibilityChangeDisposable.clear(),this.children.forEach((n,o)=>{n instanceof l&&this.childrenVisibilityChangeDisposable.add(n.onDidVisibilityChange(r=>{this.setChildVisible(o,r)}))})}trySet2x2(e){if(this.children.length!==2||e.children.length!==2)return y.None;if(this.getChildSize(0)!==e.getChildSize(0))return y.None;const[i,t]=this.children,[n,o]=e.children;if(!(i instanceof m)||!(t instanceof m))return y.None;if(!(n instanceof m)||!(o instanceof m))return y.None;this.orientation===d.VERTICAL?(t.linkedWidthNode=n.linkedHeightNode=i,i.linkedWidthNode=o.linkedHeightNode=t,o.linkedWidthNode=i.linkedHeightNode=n,n.linkedWidthNode=t.linkedHeightNode=o):(n.linkedWidthNode=t.linkedHeightNode=i,o.linkedWidthNode=i.linkedHeightNode=t,i.linkedWidthNode=o.linkedHeightNode=n,t.linkedWidthNode=n.linkedHeightNode=o);const r=this.splitview.sashes[0],a=e.splitview.sashes[0];return r.linkedSash=a,a.linkedSash=r,this._onDidChange.fire(void 0),e._onDidChange.fire(void 0),k(()=>{r.linkedSash=a.linkedSash=void 0,i.linkedHeightNode=i.linkedWidthNode=void 0,t.linkedHeightNode=t.linkedWidthNode=void 0,n.linkedHeightNode=n.linkedWidthNode=void 0,o.linkedHeightNode=o.linkedWidthNode=void 0})}updateSplitviewEdgeSnappingEnablement(){this.splitview.startSnappingEnabled=this._edgeSnapping||this._absoluteOrthogonalOffset>0,this.splitview.endSnappingEnabled=this._edgeSnapping||this._absoluteOrthogonalOffset+this._size<this.absoluteOrthogonalSize}dispose(){for(const e of this.children)e.dispose();this._onDidChange.dispose(),this._onDidSashReset.dispose(),this._onDidVisibilityChange.dispose(),this.childrenVisibilityChangeDisposable.dispose(),this.splitviewSashResetDisposable.dispose(),this.childrenSashResetDisposable.dispose(),this.childrenChangeDisposable.dispose(),this.onDidScrollDisposable.dispose(),this.splitview.dispose()}}function Z(s){const[e,i]=p.split(s.onDidChange,B);return p.any(i,p.map(p.latch(p.map(e,t=>[s.minimumWidth,s.maximumWidth,s.minimumHeight,s.maximumHeight]),H),t=>{}))}class m{constructor(e,i,t,n,o=0){this.view=e;this.orientation=i;this.layoutController=t;this._orthogonalSize=n,this._size=o;const r=Z(e);this._onDidViewChange=p.map(r,a=>a&&(this.orientation===d.VERTICAL?a.width:a.height),this.disposables),this.onDidChange=p.any(this._onDidViewChange,this._onDidSetLinkedNode.event,this._onDidLinkedWidthNodeChange.event,this._onDidLinkedHeightNodeChange.event)}_size=0;get size(){return this._size}_orthogonalSize;get orthogonalSize(){return this._orthogonalSize}absoluteOffset=0;absoluteOrthogonalOffset=0;onDidScroll=p.None;onDidSashReset=p.None;_onDidLinkedWidthNodeChange=new C;_linkedWidthNode=void 0;get linkedWidthNode(){return this._linkedWidthNode}set linkedWidthNode(e){this._onDidLinkedWidthNodeChange.input=e?e._onDidViewChange:p.None,this._linkedWidthNode=e,this._onDidSetLinkedNode.fire(void 0)}_onDidLinkedHeightNodeChange=new C;_linkedHeightNode=void 0;get linkedHeightNode(){return this._linkedHeightNode}set linkedHeightNode(e){this._onDidLinkedHeightNodeChange.input=e?e._onDidViewChange:p.None,this._linkedHeightNode=e,this._onDidSetLinkedNode.fire(void 0)}_onDidSetLinkedNode=new N;_onDidViewChange;onDidChange;disposables=new _;get width(){return this.orientation===d.HORIZONTAL?this.orthogonalSize:this.size}get height(){return this.orientation===d.HORIZONTAL?this.size:this.orthogonalSize}get top(){return this.orientation===d.HORIZONTAL?this.absoluteOffset:this.absoluteOrthogonalOffset}get left(){return this.orientation===d.HORIZONTAL?this.absoluteOrthogonalOffset:this.absoluteOffset}get element(){return this.view.element}get minimumWidth(){return this.linkedWidthNode?Math.max(this.linkedWidthNode.view.minimumWidth,this.view.minimumWidth):this.view.minimumWidth}get maximumWidth(){return this.linkedWidthNode?Math.min(this.linkedWidthNode.view.maximumWidth,this.view.maximumWidth):this.view.maximumWidth}get minimumHeight(){return this.linkedHeightNode?Math.max(this.linkedHeightNode.view.minimumHeight,this.view.minimumHeight):this.view.minimumHeight}get maximumHeight(){return this.linkedHeightNode?Math.min(this.linkedHeightNode.view.maximumHeight,this.view.maximumHeight):this.view.maximumHeight}get minimumSize(){return this.orientation===d.HORIZONTAL?this.minimumHeight:this.minimumWidth}get maximumSize(){return this.orientation===d.HORIZONTAL?this.maximumHeight:this.maximumWidth}get priority(){return this.view.priority}get proportionalLayout(){return this.view.proportionalLayout??!0}get snap(){return this.view.snap}get minimumOrthogonalSize(){return this.orientation===d.HORIZONTAL?this.minimumWidth:this.minimumHeight}get maximumOrthogonalSize(){return this.orientation===d.HORIZONTAL?this.maximumWidth:this.maximumHeight}_boundarySashes={};get boundarySashes(){return this._boundarySashes}set boundarySashes(e){this._boundarySashes=e,this.view.setBoundarySashes?.(M(e,this.orientation))}layout(e,i,t){if(this.layoutController.isLayoutEnabled){if(typeof t>"u")throw new Error("Invalid state");this._size=e,this._orthogonalSize=t.orthogonalSize,this.absoluteOffset=t.absoluteOffset+i,this.absoluteOrthogonalOffset=t.absoluteOrthogonalOffset,this._layout(this.width,this.height,this.top,this.left)}}cachedWidth=0;cachedHeight=0;cachedTop=0;cachedLeft=0;_layout(e,i,t,n){this.cachedWidth===e&&this.cachedHeight===i&&this.cachedTop===t&&this.cachedLeft===n||(this.cachedWidth=e,this.cachedHeight=i,this.cachedTop=t,this.cachedLeft=n,this.view.layout(e,i,t,n))}setVisible(e){this.view.setVisible?.(e)}dispose(){this.disposables.dispose()}}function L(s,e,i){if(s instanceof l){const t=new l(V(s.orientation),s.layoutController,s.styles,s.splitviewProportionalLayout,e,i,s.edgeSnapping);let n=0;for(let o=s.children.length-1;o>=0;o--){const r=s.children[o],a=r instanceof l?r.orthogonalSize:r.size;let h=s.size===0?0:Math.round(e*a/s.size);n+=h,o===0&&(h+=e-n),t.addChild(L(r,i,h),h,0,!0)}return s.dispose(),t}else{const t=new m(s.view,V(s.orientation),s.layoutController,i);return s.dispose(),t}}class E{element;styles;proportionalLayout;_root;onDidSashResetRelay=new C;_onDidScroll=new C;_onDidChange=new C;_boundarySashes={};layoutController;disposable2x2=y.None;get root(){return this._root}set root(e){const i=this._root;i&&(i.element.remove(),i.dispose()),this._root=e,this.element.appendChild(e.element),this.onDidSashResetRelay.input=e.onDidSashReset,this._onDidChange.input=p.map(e.onDidChange,()=>{}),this._onDidScroll.input=e.onDidScroll}onDidSashReset=this.onDidSashResetRelay.event;onDidScroll=this._onDidScroll.event;onDidChange=this._onDidChange.event;get width(){return this.root.width}get height(){return this.root.height}get minimumWidth(){return this.root.minimumWidth}get minimumHeight(){return this.root.minimumHeight}get maximumWidth(){return this.root.maximumHeight}get maximumHeight(){return this.root.maximumHeight}get orientation(){return this._root.orientation}get boundarySashes(){return this._boundarySashes}set orientation(e){if(this._root.orientation===e)return;const{size:i,orthogonalSize:t,absoluteOffset:n,absoluteOrthogonalOffset:o}=this._root;this.root=L(this._root,t,i),this.root.layout(i,0,{orthogonalSize:t,absoluteOffset:o,absoluteOrthogonalOffset:n,absoluteSize:i,absoluteOrthogonalSize:t}),this.boundarySashes=this.boundarySashes}set boundarySashes(e){this._boundarySashes=e,this.root.boundarySashes=A(e,this.orientation)}set edgeSnapping(e){this.root.edgeSnapping=e}maximizedNode=void 0;_onDidChangeViewMaximized=new N;onDidChangeViewMaximized=this._onDidChangeViewMaximized.event;constructor(e={}){this.element=x(".monaco-grid-view"),this.styles=e.styles||W,this.proportionalLayout=typeof e.proportionalLayout<"u"?!!e.proportionalLayout:!0,this.layoutController=new T(!1),this.root=new l(d.VERTICAL,this.layoutController,this.styles,this.proportionalLayout)}style(e){this.styles=e,this.root.style(e)}layout(e,i,t=0,n=0){this.layoutController.isLayoutEnabled=!0;const[o,r,a,h]=this.root.orientation===d.HORIZONTAL?[i,e,t,n]:[e,i,n,t];this.root.layout(o,0,{orthogonalSize:r,absoluteOffset:a,absoluteOrthogonalOffset:h,absoluteSize:o,absoluteOrthogonalSize:r})}addView(e,i,t){this.hasMaximizedView()&&this.exitMaximizedView(),this.disposable2x2.dispose(),this.disposable2x2=y.None;const[n,o]=w(t),[r,a]=this.getNode(n);if(a instanceof l){const h=new m(e,V(a.orientation),this.layoutController,a.orthogonalSize);try{a.addChild(h,i,o)}catch(g){throw h.dispose(),g}}else{const[,h]=w(r),[,g]=w(n);let b=0;const c=h.getChildCachedVisibleSize(g);typeof c=="number"&&(b=O.Invisible(c)),h.removeChild(g).dispose();const u=new l(a.orientation,a.layoutController,this.styles,this.proportionalLayout,a.size,a.orthogonalSize,h.edgeSnapping);h.addChild(u,a.size,g);const S=new m(a.view,h.orientation,this.layoutController,a.size);u.addChild(S,b,0),typeof i!="number"&&i.type==="split"&&(i=O.Split(0));const I=new m(e,h.orientation,this.layoutController,a.size);u.addChild(I,i,o)}this.trySet2x2()}removeView(e,i){this.hasMaximizedView()&&this.exitMaximizedView(),this.disposable2x2.dispose(),this.disposable2x2=y.None;const[t,n]=w(e),[o,r]=this.getNode(t);if(!(r instanceof l))throw new Error("Invalid location");const a=r.children[n];if(!(a instanceof m))throw new Error("Invalid location");if(r.removeChild(n,i),a.dispose(),r.children.length===0)throw new Error("Invalid grid state");if(r.children.length>1)return this.trySet2x2(),a.view;if(o.length===0){const u=r.children[0];return u instanceof m||(r.removeChild(0),r.dispose(),this.root=u,this.boundarySashes=this.boundarySashes,this.trySet2x2()),a.view}const[,h]=w(o),[,g]=w(t),b=r.isChildVisible(0),c=r.removeChild(0),f=h.children.map((u,S)=>h.getChildSize(S));if(h.removeChild(g,i),r.dispose(),c instanceof l){f.splice(g,1,...c.children.map(S=>S.size));const u=c.removeAllChildren();for(let S=0;S<u.length;S++)h.addChild(u[S],u[S].size,g+S)}else{const u=new m(c.view,V(c.orientation),this.layoutController,c.size),S=b?c.orthogonalSize:O.Invisible(c.orthogonalSize);h.addChild(u,S,g)}c.dispose();for(let u=0;u<f.length;u++)h.resizeChild(u,f[u]);return this.trySet2x2(),a.view}moveView(e,i,t){this.hasMaximizedView()&&this.exitMaximizedView();const[,n]=this.getNode(e);if(!(n instanceof l))throw new Error("Invalid location");n.moveChild(i,t),this.trySet2x2()}swapViews(e,i){this.hasMaximizedView()&&this.exitMaximizedView();const[t,n]=w(e),[,o]=this.getNode(t);if(!(o instanceof l))throw new Error("Invalid from location");const r=o.getChildSize(n),a=o.children[n];if(!(a instanceof m))throw new Error("Invalid from location");const[h,g]=w(i),[,b]=this.getNode(h);if(!(b instanceof l))throw new Error("Invalid to location");const c=b.getChildSize(g),f=b.children[g];if(!(f instanceof m))throw new Error("Invalid to location");o===b?o.swapChildren(n,g):(o.removeChild(n),b.removeChild(g),o.addChild(f,r,n),b.addChild(a,c,g)),this.trySet2x2()}resizeView(e,i){this.hasMaximizedView()&&this.exitMaximizedView();const[t,n]=w(e),[o,r]=this.getNode(t);if(!(r instanceof l))throw new Error("Invalid location");if(!i.width&&!i.height)return;const[a,h]=r.orientation===d.HORIZONTAL?[i.width,i.height]:[i.height,i.width];if(typeof h=="number"&&o.length>0){const[,g]=w(o),[,b]=w(t);g.resizeChild(b,h)}typeof a=="number"&&r.resizeChild(n,a),this.trySet2x2()}getViewSize(e){if(!e)return{width:this.root.width,height:this.root.height};const[,i]=this.getNode(e);return{width:i.width,height:i.height}}getViewCachedVisibleSize(e){const[i,t]=w(e),[,n]=this.getNode(i);if(!(n instanceof l))throw new Error("Invalid location");return n.getChildCachedVisibleSize(t)}expandView(e){this.hasMaximizedView()&&this.exitMaximizedView();const[i,t]=this.getNode(e);if(!(t instanceof m))throw new Error("Invalid location");for(let n=0;n<i.length;n++)i[n].resizeChild(e[n],Number.POSITIVE_INFINITY)}isViewExpanded(e){if(this.hasMaximizedView())return!1;const[i,t]=this.getNode(e);if(!(t instanceof m))throw new Error("Invalid location");for(let n=0;n<i.length;n++)if(!i[n].isChildExpanded(e[n]))return!1;return!0}maximizeView(e){const[,i]=this.getNode(e);if(!(i instanceof m))throw new Error("Location is not a LeafNode");if(this.maximizedNode===i)return;this.hasMaximizedView()&&this.exitMaximizedView();function t(n,o){for(let r=0;r<n.children.length;r++){const a=n.children[r];a instanceof m?a!==o&&n.setChildVisible(r,!1):t(a,o)}}t(this.root,i),this.maximizedNode=i,this._onDidChangeViewMaximized.fire(!0)}exitMaximizedView(){if(!this.maximizedNode)return;this.maximizedNode=void 0;function e(i){for(let t=i.children.length-1;t>=0;t--){const n=i.children[t];n instanceof m?i.setChildVisible(t,!0):e(n)}}e(this.root),this._onDidChangeViewMaximized.fire(!1)}hasMaximizedView(){return this.maximizedNode!==void 0}isViewMaximized(e){const[,i]=this.getNode(e);if(!(i instanceof m))throw new Error("Location is not a LeafNode");return i===this.maximizedNode}distributeViewSizes(e){if(this.hasMaximizedView()&&this.exitMaximizedView(),!e){this.root.distributeViewSizes(!0);return}const[,i]=this.getNode(e);if(!(i instanceof l))throw new Error("Invalid location");i.distributeViewSizes(),this.trySet2x2()}isViewVisible(e){const[i,t]=w(e),[,n]=this.getNode(i);if(!(n instanceof l))throw new Error("Invalid from location");return n.isChildVisible(t)}setViewVisible(e,i){if(this.hasMaximizedView()){this.exitMaximizedView();return}const[t,n]=w(e),[,o]=this.getNode(t);if(!(o instanceof l))throw new Error("Invalid from location");o.setChildVisible(n,i)}getView(e){const i=e?this.getNode(e)[1]:this._root;return this._getViews(i,this.orientation)}static deserialize(e,i,t={}){if(typeof e.orientation!="number")throw new Error("Invalid JSON: 'orientation' property must be a number.");if(typeof e.width!="number")throw new Error("Invalid JSON: 'width' property must be a number.");if(typeof e.height!="number")throw new Error("Invalid JSON: 'height' property must be a number.");if(e.root?.type!=="branch")throw new Error("Invalid JSON: 'root' property must have 'type' value of branch.");const n=e.orientation,o=e.height,r=new E(t);return r._deserialize(e.root,n,i,o),r}_deserialize(e,i,t,n){this.root=this._deserializeNode(e,i,t,n)}_deserializeNode(e,i,t,n){let o;if(e.type==="branch"){const a=e.data.map(h=>({node:this._deserializeNode(h,V(i),t,e.size),visible:h.visible}));o=new l(i,this.layoutController,this.styles,this.proportionalLayout,e.size,n,void 0,a)}else o=new m(t.fromJSON(e.data),i,this.layoutController,n,e.size),e.maximized&&!this.maximizedNode&&(this.maximizedNode=o,this._onDidChangeViewMaximized.fire(!0));return o}_getViews(e,i,t){const n={top:e.top,left:e.left,width:e.width,height:e.height};if(e instanceof m)return{view:e.view,box:n,cachedVisibleSize:t,maximized:this.maximizedNode===e};const o=[];for(let r=0;r<e.children.length;r++){const a=e.children[r],h=e.getChildCachedVisibleSize(r);o.push(this._getViews(a,V(i),h))}return{children:o,box:n}}getNode(e,i=this.root,t=[]){if(e.length===0)return[t,i];if(!(i instanceof l))throw new Error("Invalid location");const[n,...o]=e;if(n<0||n>=i.children.length)throw new Error("Invalid location");const r=i.children[n];return t.push(i),this.getNode(o,r,t)}trySet2x2(){if(this.disposable2x2.dispose(),this.disposable2x2=y.None,this.root.children.length!==2)return;const[e,i]=this.root.children;!(e instanceof l)||!(i instanceof l)||(this.disposable2x2=e.trySet2x2(i))}getViewMap(e,i){i||(i=this.root),i instanceof l?i.children.forEach(t=>this.getViewMap(e,t)):e.set(i.view,i.element)}dispose(){this.onDidSashResetRelay.dispose(),this.root.dispose(),this.element.remove()}}export{E as GridView,ue as LayoutPriority,de as Orientation,me as Sizing,se as isGridBranchNode,V as orthogonal};
