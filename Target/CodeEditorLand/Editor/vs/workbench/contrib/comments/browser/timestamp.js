import*as r from"../../../../base/browser/dom.js";import{getDefaultHoverDelegate as s}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{fromNow as o}from"../../../../base/common/date.js";import{Disposable as n}from"../../../../base/common/lifecycle.js";import{language as m}from"../../../../base/common/platform.js";import"../../../../platform/configuration/common/configuration.js";import{COMMENTS_SECTION as v}from"../common/commentsConfiguration.js";class c extends n{constructor(e,t,i,a){super();this.configurationService=e;this._date=r.append(i,r.$("span.timestamp")),this._date.style.display="none",this._useRelativeTime=this.useRelativeTimeSetting,this.hover=this._register(t.setupManagedHover(s("mouse"),this._date,"")),this.setTimestamp(a)}_date;_timestamp;_useRelativeTime;hover;get useRelativeTimeSetting(){return this.configurationService.getValue(v).useRelativeTime}async setTimestamp(e){(e!==this._timestamp||this.useRelativeTimeSetting!==this._useRelativeTime)&&this.updateDate(e),this._timestamp=e,this._useRelativeTime=this.useRelativeTimeSetting}updateDate(e){if(!e)this._date.textContent="",this._date.style.display="none";else if(e!==this._timestamp||this.useRelativeTimeSetting!==this._useRelativeTime){this._date.style.display="";let t,i;this.useRelativeTimeSetting?(t=this.getRelative(e),i=this.getDateString(e)):t=this.getDateString(e),this._date.textContent=t,this.hover.update(i??"")}}getRelative(e){return o(e,!0,!0)}getDateString(e){return e.toLocaleString(m)}}export{c as TimestampWidget};
