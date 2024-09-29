var d=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var g=(a,o,e,s)=>{for(var t=s>1?void 0:s?M(o,e):o,n=a.length-1,i;n>=0;n--)(i=a[n])&&(t=(s?i(o,e,t):i(t))||t);return s&&t&&d(o,e,t),t},p=(a,o)=>(e,s)=>o(e,s,a);import{Emitter as u}from"../../../../../base/common/event.js";import{Disposable as v}from"../../../../../base/common/lifecycle.js";import"../../common/notebookRendererMessagingService.js";import{IExtensionService as l}from"../../../../services/extensions/common/extensions.js";let r=class extends v{constructor(e){super();this.extensionService=e}activations=new Map;scopedMessaging=new Map;postMessageEmitter=this._register(new u);onShouldPostMessage=this.postMessageEmitter.event;receiveMessage(e,s,t){if(e===void 0){const n=[...this.scopedMessaging.values()].map(i=>i.receiveMessageHandler?.(s,t));return Promise.all(n).then(i=>i.some(c=>!!c))}return this.scopedMessaging.get(e)?.receiveMessageHandler?.(s,t)??Promise.resolve(!1)}prepare(e){if(this.activations.has(e))return;const s=[];this.activations.set(e,s),this.extensionService.activateByEvent(`onRenderer:${e}`).then(()=>{for(const t of s)this.postMessageEmitter.fire(t);this.activations.set(e,void 0)})}getScoped(e){const s=this.scopedMessaging.get(e);if(s)return s;const t={postMessage:(n,i)=>this.postMessage(e,n,i),dispose:()=>this.scopedMessaging.delete(e)};return this.scopedMessaging.set(e,t),t}postMessage(e,s,t){this.activations.has(s)||this.prepare(s);const n=this.activations.get(s),i={rendererId:s,editorId:e,message:t};n===void 0?this.postMessageEmitter.fire(i):n.push(i)}};r=g([p(0,l)],r);export{r as NotebookRendererMessagingService};
