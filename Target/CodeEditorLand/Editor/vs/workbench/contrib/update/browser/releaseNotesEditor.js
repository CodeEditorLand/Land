var N=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var w=(u,e,t,r)=>{for(var i=r>1?void 0:r?W(e,t):e,l=u.length-1,a;l>=0;l--)(a=u[l])&&(i=(r?a(e,t,i):a(i))||i);return r&&i&&N(e,t,i),i},o=(u,e)=>(t,r)=>e(t,r,u);import"./media/releasenoteseditor.css";import{CancellationToken as P}from"../../../../base/common/cancellation.js";import{onUnexpectedError as T}from"../../../../base/common/errors.js";import{escapeMarkdownSyntaxTokens as x}from"../../../../base/common/htmlContent.js";import{KeybindingParser as $}from"../../../../base/common/keybindingParser.js";import{escape as L}from"../../../../base/common/strings.js";import{URI as _}from"../../../../base/common/uri.js";import{generateUuid as D}from"../../../../base/common/uuid.js";import{TokenizationRegistry as R}from"../../../../editor/common/languages.js";import{generateTokensCSSForColorMap as U}from"../../../../editor/common/languages/supports/tokenization.js";import{ILanguageService as z}from"../../../../editor/common/languages/language.js";import*as y from"../../../../nls.js";import{IEnvironmentService as q}from"../../../../platform/environment/common/environment.js";import{IKeybindingService as A}from"../../../../platform/keybinding/common/keybinding.js";import{IOpenerService as M}from"../../../../platform/opener/common/opener.js";import{IProductService as G}from"../../../../platform/product/common/productService.js";import{asTextOrError as K,IRequestService as O}from"../../../../platform/request/common/request.js";import{DEFAULT_MARKDOWN_STYLES as B,renderMarkdownDocument as H}from"../../markdown/browser/markdownDocumentRenderer.js";import"../../webviewPanel/browser/webviewEditorInput.js";import{IWebviewWorkbenchService as V}from"../../webviewPanel/browser/webviewWorkbenchService.js";import{IEditorGroupsService as F}from"../../../services/editor/common/editorGroupsService.js";import{ACTIVE_GROUP as Y,IEditorService as X}from"../../../services/editor/common/editorService.js";import{IExtensionService as j}from"../../../services/extensions/common/extensions.js";import{getTelemetryLevel as J,supportsTelemetry as Q}from"../../../../platform/telemetry/common/telemetryUtils.js";import{IConfigurationService as Z}from"../../../../platform/configuration/common/configuration.js";import{TelemetryLevel as ee}from"../../../../platform/telemetry/common/telemetry.js";import{DisposableStore as k}from"../../../../base/common/lifecycle.js";import{SimpleSettingRenderer as te}from"../../markdown/browser/markdownSettingRenderer.js";import{IInstantiationService as re}from"../../../../platform/instantiation/common/instantiation.js";import{Schemas as C}from"../../../../base/common/network.js";import{ICodeEditorService as ie}from"../../../../editor/browser/services/codeEditorService.js";let f=class{constructor(e,t,r,i,l,a,p,c,m,g,d,h,b){this._environmentService=e;this._keybindingService=t;this._languageService=r;this._openerService=i;this._requestService=l;this._configurationService=a;this._editorService=p;this._editorGroupService=c;this._codeEditorService=m;this._webviewWorkbenchService=g;this._extensionService=d;this._productService=h;this._instantiationService=b;R.onDidChange(()=>this.updateHtml()),a.onDidChangeConfiguration(this.onDidChangeConfiguration,this,this.disposables),g.onDidChangeActiveWebviewEditor(this.onDidChangeActiveWebviewEditor,this,this.disposables),this._simpleSettingRenderer=this._instantiationService.createInstance(te)}_simpleSettingRenderer;_releaseNotesCache=new Map;_currentReleaseNotes=void 0;_lastText;disposables=new k;async updateHtml(){if(!this._currentReleaseNotes||!this._lastText)return;const e=await this.renderBody(this._lastText);this._currentReleaseNotes&&this._currentReleaseNotes.webview.setHtml(e)}async show(e,t){const r=await this.loadReleaseNotes(e,t);this._lastText=r;const i=await this.renderBody(r),l=y.localize("releaseNotesInputName","Release Notes: {0}",e),a=this._editorService.activeEditorPane;if(this._currentReleaseNotes)this._currentReleaseNotes.setName(l),this._currentReleaseNotes.webview.setHtml(i),this._webviewWorkbenchService.revealWebview(this._currentReleaseNotes,a?a.group:this._editorGroupService.activeGroup,!1);else{this._currentReleaseNotes=this._webviewWorkbenchService.openWebview({title:l,options:{tryRestoreScrollPosition:!0,enableFindWidget:!0,disableServiceWorker:!0},contentOptions:{localResourceRoots:[],allowScripts:!0},extension:void 0},"releaseNotes",l,{group:Y,preserveFocus:!1}),this._currentReleaseNotes.webview.onDidClickLink(c=>this.onDidClickLink(_.parse(c)));const p=new k;p.add(this._currentReleaseNotes.webview.onMessage(c=>{if(c.message.type==="showReleaseNotes")this._configurationService.updateValue("update.showReleaseNotes",c.message.value);else if(c.message.type==="clickSetting"){const m=this._currentReleaseNotes?.webview.container.offsetLeft+c.message.value.x,g=this._currentReleaseNotes?.webview.container.offsetTop+c.message.value.y;this._simpleSettingRenderer.updateSetting(_.parse(c.message.value.uri),m,g)}})),p.add(this._currentReleaseNotes.onWillDispose(()=>{p.dispose(),this._currentReleaseNotes=void 0})),this._currentReleaseNotes.webview.setHtml(i)}return!0}async loadReleaseNotes(e,t){const r=/^(\d+\.\d+)\./.exec(e);if(!r)throw new Error("not found");const a=`https://code.visualstudio.com/raw/v${r[1].replace(/\./g,"_")}.md`,p=y.localize("unassigned","unassigned"),c=d=>L(d).replace(/\\/g,"\\\\"),m=d=>{const h=(v,n)=>{const s=this._keybindingService.lookupKeybinding(n);return s&&s.getLabel()||p},b=(v,n)=>{const s=$.parseKeybinding(n);if(!s)return p;const S=this._keybindingService.resolveKeybinding(s);return S.length===0?p:S[0].getLabel()||p},E=(v,n)=>{const s=h(v,n);return s&&`<code title="${n}">${c(s)}</code>`},I=(v,n)=>{const s=b(v,n);return s&&`<code title="${n}">${c(s)}</code>`};return d.replace(/`kb\(([a-z.\d\-]+)\)`/gi,E).replace(/`kbstyle\(([^\)]+)\)`/gi,I).replace(/kb\(([a-z.\d\-]+)\)/gi,(v,n)=>x(h(v,n))).replace(/kbstyle\(([^\)]+)\)/gi,(v,n)=>x(b(v,n)))},g=async()=>{let d;try{if(t){const h=this._codeEditorService.getActiveCodeEditor()?.getModel()?.getValue();d=h?h.substring(h.indexOf("#")):void 0}else d=await K(await this._requestService.request({url:a},P.None))}catch{throw new Error("Failed to fetch release notes")}if(!d||!/^#\s/.test(d)&&!t)throw new Error("Invalid release notes");return m(d)};return t?g():(this._releaseNotesCache.has(e)||this._releaseNotesCache.set(e,(async()=>{try{return await g()}catch(d){throw this._releaseNotesCache.delete(e),d}})()),this._releaseNotesCache.get(e))}async onDidClickLink(e){e.scheme===C.codeSetting||this.addGAParameters(e,"ReleaseNotes").then(t=>this._openerService.open(t,{allowCommands:["workbench.action.openSettings"]})).then(void 0,T)}async addGAParameters(e,t,r="1"){return Q(this._productService,this._environmentService)&&J(this._configurationService)===ee.USAGE&&e.scheme==="https"&&e.authority==="code.visualstudio.com"?e.with({query:`${e.query?e.query+"&":""}utm_source=VsCode&utm_medium=${encodeURIComponent(t)}&utm_content=${encodeURIComponent(r)}`}):e}async renderBody(e){const t=D(),r=await H(e,this._extensionService,this._languageService,{shouldSanitize:!1,markedExtensions:[{renderer:{html:this._simpleSettingRenderer.getHtmlRenderer(),codespan:this._simpleSettingRenderer.getCodeSpanRenderer()}}]}),i=R.getColorMap(),l=i?U(i):"",a=!!this._configurationService.getValue("update.showReleaseNotes");return`<!DOCTYPE html>
		<html>
			<head>
				<base href="https://code.visualstudio.com/raw/">
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${t}' https://code.visualstudio.com; script-src 'nonce-${t}';">
				<style nonce="${t}">
					${B}
					${l}

					/* codesetting */

					code:has(.codesetting)+code:not(:has(.codesetting)) {
						display: none;
					}

					code:has(.codesetting) {
						background-color: var(--vscode-textPreformat-background);
						color: var(--vscode-textPreformat-foreground);
						padding-left: 1px;
						margin-right: 3px;
						padding-right: 0px;
					}

					code:has(.codesetting):focus {
						border: 1px solid var(--vscode-button-border, transparent);
					}

					.codesetting {
						color: var(--vscode-textPreformat-foreground);
						padding: 0px 1px 1px 0px;
						font-size: 0px;
						overflow: hidden;
						text-overflow: ellipsis;
						outline-offset: 2px !important;
						box-sizing: border-box;
						text-align: center;
						cursor: pointer;
						display: inline;
						margin-right: 3px;
					}
					.codesetting svg {
						font-size: 12px;
						text-align: center;
						cursor: pointer;
						border: 1px solid var(--vscode-button-secondaryBorder, transparent);
						outline: 1px solid transparent;
						line-height: 9px;
						margin-bottom: -5px;
						padding-left: 0px;
						padding-top: 2px;
						padding-bottom: 2px;
						padding-right: 2px;
						display: inline-block;
						text-decoration: none;
						text-rendering: auto;
						text-transform: none;
						-webkit-font-smoothing: antialiased;
						-moz-osx-font-smoothing: grayscale;
						user-select: none;
						-webkit-user-select: none;
					}
					.codesetting .setting-name {
						font-size: 13px;
						padding-left: 2px;
						padding-right: 3px;
						padding-top: 1px;
						padding-bottom: 1px;
						margin-left: -5px;
						margin-top: -3px;
					}
					.codesetting:hover {
						color: var(--vscode-textPreformat-foreground) !important;
						text-decoration: none !important;
					}
					code:has(.codesetting):hover {
						filter: brightness(140%);
						text-decoration: none !important;
					}
					.codesetting:focus {
						outline: 0 !important;
						text-decoration: none !important;
						color: var(--vscode-button-hoverForeground) !important;
					}
					.codesetting .separator {
						width: 1px;
						height: 14px;
						margin-bottom: -3px;
						display: inline-block;
						background-color: var(--vscode-editor-background);
						font-size: 12px;
						margin-right: 8px;
					}

					header { display: flex; align-items: center; padding-top: 1em; }
				</style>
			</head>
			<body>
				${r}
				<script nonce="${t}">
					const vscode = acquireVsCodeApi();
					const container = document.createElement('p');
					container.style.display = 'flex';
					container.style.alignItems = 'center';

					const input = document.createElement('input');
					input.type = 'checkbox';
					input.id = 'showReleaseNotes';
					input.checked = ${a};
					container.appendChild(input);

					const label = document.createElement('label');
					label.htmlFor = 'showReleaseNotes';
					label.textContent = '${y.localize("showOnUpdate","Show release notes after an update")}';
					container.appendChild(label);

					const beforeElement = document.querySelector("body > h1")?.nextElementSibling;
					if (beforeElement) {
						document.body.insertBefore(container, beforeElement);
					} else {
						document.body.appendChild(container);
					}

					window.addEventListener('message', event => {
						if (event.data.type === 'showReleaseNotes') {
							input.checked = event.data.value;
						}
					});

					window.addEventListener('click', event => {
						const href = event.target.href ?? event.target.parentElement?.href ?? event.target.parentElement?.parentElement?.href;
						if (href && (href.startsWith('${C.codeSetting}'))) {
							vscode.postMessage({ type: 'clickSetting', value: { uri: href, x: event.clientX, y: event.clientY }});
						}
					});

					window.addEventListener('keypress', event => {
						if (event.keyCode === 13) {
							if (event.target.children.length > 0 && event.target.children[0].href) {
								const clientRect = event.target.getBoundingClientRect();
								vscode.postMessage({ type: 'clickSetting', value: { uri: event.target.children[0].href, x: clientRect.right , y: clientRect.bottom }});
							}
						}
					});

					input.addEventListener('change', event => {
						vscode.postMessage({ type: 'showReleaseNotes', value: input.checked }, '*');
					});
				</script>
			</body>
		</html>`}onDidChangeConfiguration(e){e.affectsConfiguration("update.showReleaseNotes")&&this.updateCheckboxWebview()}onDidChangeActiveWebviewEditor(e){e&&e===this._currentReleaseNotes&&this.updateCheckboxWebview()}updateCheckboxWebview(){this._currentReleaseNotes&&this._currentReleaseNotes.webview.postMessage({type:"showReleaseNotes",value:this._configurationService.getValue("update.showReleaseNotes")})}};f=w([o(0,q),o(1,A),o(2,z),o(3,M),o(4,O),o(5,Z),o(6,X),o(7,F),o(8,ie),o(9,V),o(10,j),o(11,G),o(12,re)],f);export{f as ReleaseNotesManager};
