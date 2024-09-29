import{localize as l}from"../../../../nls.js";import"./terminal.js";import{TerminalCapability as s}from"../../../../platform/terminal/common/capabilities/capabilities.js";import{asArray as c}from"../../../../base/common/arrays.js";import{MarkdownString as h}from"../../../../base/common/htmlContent.js";function C(n){let o="";const e=n.statusList.statuses,t=[];for(const i of e)o+=`

---

${i.icon?`$(${i.icon?.id}) `:""}${i.tooltip||i.id}`,i.hoverActions&&t.push(...i.hoverActions);const r=p(n,!0),a=g(n,!0);return{content:new h(n.title+r+a+o,{supportThemeIcons:!0}),actions:t}}function g(n,o){const e=[];n.capabilities.has(s.CommandDetection)&&e.push(s.CommandDetection),n.capabilities.has(s.CwdDetection)&&e.push(s.CwdDetection);let t="";return e.length>0?t+=`${o?`

---

`:`

`}${l("shellIntegration.enabled","Shell integration activated")}`:n.shellLaunchConfig.ignoreShellIntegration?t+=`${o?`

---

`:`

`}${l("launchFailed.exitCodeOnlyShellIntegration","The terminal process failed to launch. Disabling shell integration with terminal.integrated.shellIntegration.enabled might help.")}`:n.usedShellIntegrationInjection&&(t+=`${o?`

---

`:`

`}${l("shellIntegration.activationFailed","Shell integration failed to activate")}`),t}function p(n,o){const e=[];if(n.processId&&n.processId>0&&e.push(l({key:"shellProcessTooltip.processId",comment:[`The first arg is "PID" which shouldn't be translated`]},"Process ID ({0}): {1}","PID",n.processId)+`
`),n.shellLaunchConfig.executable){let t=n.shellLaunchConfig.executable;const r=c(n.injectedArgs||n.shellLaunchConfig.args||[]).map(a=>`'${a}'`).join(" ");r&&(t+=` ${r}`),e.push(l("shellProcessTooltip.commandLine","Command line: {0}",t))}return e.length?`${o?`

---

`:`

`}${e.join(`
`)}`:""}export{C as getInstanceHoverInfo,g as getShellIntegrationTooltip,p as getShellProcessTooltip};
