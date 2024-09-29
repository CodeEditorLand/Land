import{groupBy as h}from"../../../../base/common/arrays.js";import{isDefined as R}from"../../../../base/common/types.js";import"../../../../editor/browser/editorExtensions.js";import{localize as k}from"../../../../nls.js";import{CommandsRegistry as P}from"../../../../platform/commands/common/commands.js";import{IQuickInputService as S}from"../../../../platform/quickinput/common/quickInput.js";import{ThemeIcon as b}from"../../../../base/common/themables.js";import{testingUpdateProfiles as v}from"./icons.js";import{testConfigurationGroupNames as w}from"../common/constants.js";import"../common/testTypes.js";import{canUseProfileWithTest as Q,ITestProfileService as I}from"../common/testProfileService.js";import{DisposableStore as g}from"../../../../base/common/lifecycle.js";function T(o,{onlyGroup:r,showConfigureButtons:s=!0,onlyForTest:e,onlyConfigurable:t,placeholder:l=k("testConfigurationUi.pick","Pick a test profile to use")}){const i=o.get(I),n=[],d=(f,p)=>{for(const m of h(f,(u,c)=>u.group-c.group)){let u=!1;if(r){if(m[0].group!==r)continue;u=!0}for(const c of m)t&&!c.hasConfigurationHandler||(u||(n.push({type:"separator",label:w[m[0].group]}),u=!0),n.push({type:"item",profile:c,label:c.label,description:p,alwaysShow:!0,buttons:c.hasConfigurationHandler&&s?[{iconClass:b.asClassName(v),tooltip:k("updateTestConfiguration","Update Test Configuration")}]:[]}))}};if(e!==void 0)d(i.getControllerProfiles(e.controllerId).filter(f=>Q(f,e)));else for(const{profiles:f,controller:p}of i.all())d(f,p.label.get());const a=o.get(S).createQuickPick({useSeparators:!0});return a.items=n,a.placeholder=l,a}const C=(o,r)=>s=>{const e=s.item.profile;e&&(o.configure(e.controllerId,e.profileId),r(void 0))};P.registerCommand({id:"vscode.pickMultipleTestProfiles",handler:async(o,r)=>{const s=o.get(I),e=T(o,r);if(!e)return;const t=new g;t.add(e),e.canSelectMany=!0,r.selected&&(e.selectedItems=e.items.filter(i=>i.type==="item").filter(i=>r.selected.some(n=>n.controllerId===i.profile.controllerId&&n.profileId===i.profile.profileId)));const l=await new Promise(i=>{t.add(e.onDidAccept(()=>{const n=e.selectedItems;i(n.map(d=>d.profile).filter(R))})),t.add(e.onDidHide(()=>i(void 0))),t.add(e.onDidTriggerItemButton(C(s,i))),e.show()});return t.dispose(),l}}),P.registerCommand({id:"vscode.pickTestProfile",handler:async(o,r)=>{const s=o.get(I),e=T(o,r);if(!e)return;const t=new g;t.add(e);const l=await new Promise(i=>{t.add(e.onDidAccept(()=>i(e.selectedItems[0]?.profile))),t.add(e.onDidHide(()=>i(void 0))),t.add(e.onDidTriggerItemButton(C(s,i))),e.show()});return t.dispose(),l}});
