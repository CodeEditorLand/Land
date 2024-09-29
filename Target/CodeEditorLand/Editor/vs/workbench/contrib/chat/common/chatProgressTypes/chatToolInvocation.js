import{DeferredPromise as o}from"../../../../../base/common/async.js";import"../chatService.js";import"../languageModelToolsService.js";class f{constructor(t,i){this.invocationMessage=t;this._confirmationMessages=i;i||(this._isConfirmed=!0,this._confirmDeferred.complete(!0)),this._confirmDeferred.p.then(e=>{this._isConfirmed=e,this._confirmationMessages=void 0,e||this.complete()})}kind="toolInvocation";_isComplete=!1;get isComplete(){return this._isComplete}_isCanceled;get isCanceled(){return this._isCanceled}_confirmDeferred=new o;get confirmed(){return this._confirmDeferred}_isConfirmed;get isConfirmed(){return this._isConfirmed}complete(){if(this._isComplete)throw new Error("Invocation is already complete.");this._isComplete=!0}get confirmationMessages(){return this._confirmationMessages}toJSON(){return{kind:"toolInvocationSerialized",invocationMessage:this.invocationMessage,isConfirmed:this._isConfirmed??!1}}}export{f as ChatToolInvocation};
