import"./media/style.css";import{registerThemingParticipant as m}from"../../platform/theme/common/themeService.js";import{WORKBENCH_BACKGROUND as c,TITLE_BAR_ACTIVE_BACKGROUND as d}from"../common/theme.js";import{isWeb as l,isIOS as s}from"../../base/common/platform.js";import{createMetaElement as u}from"../../base/browser/dom.js";import{isSafari as f,isStandalone as b}from"../../base/browser/browser.js";import{selectionBackground as g}from"../../platform/theme/common/colorRegistry.js";import{mainWindow as k}from"../../base/browser/window.js";m((t,e)=>{const n=c(t);e.addRule(`.monaco-workbench { background-color: ${n}; }`);const r=t.getColor(g);if(r&&e.addRule(`.monaco-workbench ::selection { background-color: ${r}; }`),l){const i=t.getColor(d);if(i){const a="monaco-workbench-meta-theme-color";let o=k.document.getElementById(a);o||(o=u(),o.name="theme-color",o.id=a),o.content=i.toString()}}f&&e.addRule(`
			body.web {
				touch-action: none;
			}
			.monaco-workbench .monaco-editor .view-lines {
				user-select: text;
				-webkit-user-select: text;
			}
		`),s&&b()&&e.addRule(`body { background-color: ${n}; }`)});
