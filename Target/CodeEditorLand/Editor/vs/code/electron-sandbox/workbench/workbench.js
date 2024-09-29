(function(){const u=window.MonacoBootstrapWindow,m=window.vscode;performance.mark("code/didStartRenderer"),u.load("vs/workbench/workbench.desktop.main",function(t,o){return performance.mark("code/didLoadWorkbenchMain"),t.main(o)},{configureDeveloperSettings:function(t){return{forceDisableShowDevtoolsOnError:typeof t.extensionTestsPath=="string"||t["enable-smoke-test-driver"]===!0,forceEnableDeveloperKeybindings:Array.isArray(t.extensionDevelopmentPath)&&t.extensionDevelopmentPath.length>0,removeDeveloperKeybindingsAfterLoad:!0}},canModifyDOM:function(t){w(t)},beforeImport:function(t){performance.mark("code/willLoadWorkbenchMain"),Object.defineProperty(window,"vscodeWindowId",{get:()=>t.windowId}),window.requestIdleCallback(()=>{const o=document.createElement("canvas");o.getContext("2d")?.clearRect(0,0,o.width,o.height),o.remove()},{timeout:50})}});function w(t){performance.mark("code/willShowPartsSplash");let o=t.partsSplash;o&&(t.autoDetectHighContrast&&t.colorScheme.highContrast?(t.colorScheme.dark&&o.baseTheme!=="hc-black"||!t.colorScheme.dark&&o.baseTheme!=="hc-light")&&(o=void 0):t.autoDetectColorScheme&&(t.colorScheme.dark&&o.baseTheme!=="vs-dark"||!t.colorScheme.dark&&o.baseTheme!=="vs")&&(o=void 0)),o&&t.extensionDevelopmentPath&&(o.layoutInfo=void 0);let d,s,n;o?(d=o.baseTheme,s=o.colorInfo.editorBackground,n=o.colorInfo.foreground):t.autoDetectHighContrast&&t.colorScheme.highContrast?t.colorScheme.dark?(d="hc-black",s="#000000",n="#FFFFFF"):(d="hc-light",s="#FFFFFF",n="#000000"):t.autoDetectColorScheme&&(t.colorScheme.dark?(d="vs-dark",s="#1E1E1E",n="#CCCCCC"):(d="vs",s="#FFFFFF",n="#000000"));const l=document.createElement("style");if(l.className="initialShellColors",window.document.head.appendChild(l),l.textContent=`body {
				background-color: ${s};
				color: ${n};
				margin: 0;
				padding: 0;
			}`,typeof o?.zoomLevel=="number"&&typeof m?.webFrame?.setZoomLevel=="function"&&m.webFrame.setZoomLevel(o.zoomLevel),o?.layoutInfo){const{layoutInfo:e,colorInfo:r}=o,a=document.createElement("div");a.id="monaco-parts-splash",a.className=d??"vs-dark",e.windowBorder&&r.windowBorder&&(a.setAttribute("style",`
						position: relative;
						height: calc(100vh - 2px);
						width: calc(100vw - 2px);
						border: 1px solid var(--window-border-color);
					`),a.style.setProperty("--window-border-color",r.windowBorder),e.windowBorderRadius&&(a.style.borderRadius=e.windowBorderRadius)),e.sideBarWidth=Math.min(e.sideBarWidth,window.innerWidth-(e.activityBarWidth+e.editorPartMinWidth));const c=document.createElement("div");if(c.setAttribute("style",`
					position: absolute;
					width: 100%;
					height: ${e.titleBarHeight}px;
					left: 0;
					top: 0;
					background-color: ${r.titleBarBackground};
					-webkit-app-region: drag;
				`),a.appendChild(c),r.titleBarBorder&&e.titleBarHeight>0){const i=document.createElement("div");i.setAttribute("style",`
						position: absolute;
						width: 100%;
						height: 1px;
						left: 0;
						bottom: 0;
						border-bottom: 1px solid ${r.titleBarBorder};
					`),c.appendChild(i)}const h=document.createElement("div");if(h.setAttribute("style",`
					position: absolute;
					width: ${e.activityBarWidth}px;
					height: calc(100% - ${e.titleBarHeight+e.statusBarHeight}px);
					top: ${e.titleBarHeight}px;
					${e.sideBarSide}: 0;
					background-color: ${r.activityBarBackground};
				`),a.appendChild(h),r.activityBarBorder&&e.activityBarWidth>0){const i=document.createElement("div");i.setAttribute("style",`
						position: absolute;
						width: 1px;
						height: 100%;
						top: 0;
						${e.sideBarSide==="left"?"right":"left"}: 0;
						${e.sideBarSide==="left"?"border-right":"border-left"}: 1px solid ${r.activityBarBorder};
					`),h.appendChild(i)}if(t.workspace){const i=document.createElement("div");if(i.setAttribute("style",`
						position: absolute;
						width: ${e.sideBarWidth}px;
						height: calc(100% - ${e.titleBarHeight+e.statusBarHeight}px);
						top: ${e.titleBarHeight}px;
						${e.sideBarSide}: ${e.activityBarWidth}px;
						background-color: ${r.sideBarBackground};
					`),a.appendChild(i),r.sideBarBorder&&e.sideBarWidth>0){const b=document.createElement("div");b.setAttribute("style",`
							position: absolute;
							width: 1px;
							height: 100%;
							top: 0;
							right: 0;
							${e.sideBarSide==="left"?"right":"left"}: 0;
							${e.sideBarSide==="left"?"border-right":"border-left"}: 1px solid ${r.sideBarBorder};
						`),i.appendChild(b)}}const p=document.createElement("div");if(p.setAttribute("style",`
					position: absolute;
					width: 100%;
					height: ${e.statusBarHeight}px;
					bottom: 0;
					left: 0;
					background-color: ${t.workspace?r.statusBarBackground:r.statusBarNoFolderBackground};
				`),a.appendChild(p),r.statusBarBorder&&e.statusBarHeight>0){const i=document.createElement("div");i.setAttribute("style",`
						position: absolute;
						width: 100%;
						height: 1px;
						top: 0;
						border-top: 1px solid ${r.statusBarBorder};
					`),p.appendChild(i)}window.document.body.appendChild(a)}performance.mark("code/didShowPartsSplash")}})();
