import{registerColor as e,foreground as a,editorInfoForeground as I,editorWarningForeground as u,errorForeground as po,badgeBackground as ko,badgeForeground as Co,listDeemphasizedForeground as wo,contrastBorder as So,inputBorder as Fo,toolbarHoverBackground as mo}from"../../../../platform/theme/common/colorRegistry.js";import{registerThemingParticipant as fo}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as r}from"../../../../base/common/themables.js";import{Color as $o}from"../../../../base/common/color.js";import{localize as c}from"../../../../nls.js";import*as n from"./debugIcons.js";import{isHighContrast as vo}from"../../../../platform/theme/common/theme.js";const Vo=e("debugToolBar.background",{dark:"#333333",light:"#F3F3F3",hcDark:"#000000",hcLight:"#FFFFFF"},c("debugToolBarBackground","Debug toolbar background color.")),To=e("debugToolBar.border",null,c("debugToolBarBorder","Debug toolbar border color.")),Io=e("debugIcon.startForeground",{dark:"#89D185",light:"#388A34",hcDark:"#89D185",hcLight:"#388A34"},c("debugIcon.startForeground","Debug toolbar icon for start debugging."));function Ro(){const D=e("debugTokenExpression.name",{dark:"#c586c0",light:"#9b46b0",hcDark:a,hcLight:a},"Foreground color for the token names shown in the debug views (ie. the Variables or Watch view)."),x=e("debugTokenExpression.type",{dark:"#4A90E2",light:"#4A90E2",hcDark:a,hcLight:a},"Foreground color for the token types shown in the debug views (ie. the Variables or Watch view)."),L=e("debugTokenExpression.value",{dark:"#cccccc99",light:"#6c6c6ccc",hcDark:a,hcLight:a},"Foreground color for the token values shown in the debug views (ie. the Variables or Watch view)."),B=e("debugTokenExpression.string",{dark:"#ce9178",light:"#a31515",hcDark:"#f48771",hcLight:"#a31515"},"Foreground color for strings in the debug views (ie. the Variables or Watch view)."),E=e("debugTokenExpression.boolean",{dark:"#4e94ce",light:"#0000ff",hcDark:"#75bdfe",hcLight:"#0000ff"},"Foreground color for booleans in the debug views (ie. the Variables or Watch view)."),A=e("debugTokenExpression.number",{dark:"#b5cea8",light:"#098658",hcDark:"#89d185",hcLight:"#098658"},"Foreground color for numbers in the debug views (ie. the Variables or Watch view)."),V=e("debugTokenExpression.error",{dark:"#f48771",light:"#e51400",hcDark:"#f48771",hcLight:"#e51400"},"Foreground color for expression errors in the debug views (ie. the Variables or Watch view) and for error logs shown in the debug console."),T=e("debugView.exceptionLabelForeground",{dark:a,light:"#FFF",hcDark:a,hcLight:a},"Foreground color for a label shown in the CALL STACK view when the debugger breaks on an exception."),R=e("debugView.exceptionLabelBackground",{dark:"#6C2022",light:"#A31515",hcDark:"#6C2022",hcLight:"#A31515"},"Background color for a label shown in the CALL STACK view when the debugger breaks on an exception."),y=e("debugView.stateLabelForeground",a,"Foreground color for a label in the CALL STACK view showing the current session's or thread's state."),O=e("debugView.stateLabelBackground","#88888844","Background color for a label in the CALL STACK view showing the current session's or thread's state."),W=e("debugView.valueChangedHighlight","#569CD6","Color used to highlight value changes in the debug views (ie. in the Variables view)."),P=e("debugConsole.infoForeground",{dark:I,light:I,hcDark:a,hcLight:a},"Foreground color for info messages in debug REPL console."),H=e("debugConsole.warningForeground",{dark:u,light:u,hcDark:"#008000",hcLight:u},"Foreground color for warning messages in debug REPL console."),z=e("debugConsole.errorForeground",po,"Foreground color for error messages in debug REPL console."),K=e("debugConsole.sourceForeground",a,"Foreground color for source filenames in debug REPL console."),d=e("debugConsoleInputIcon.foreground",a,"Foreground color for debug console input marker icon."),N=e("debugIcon.pauseForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c("debugIcon.pauseForeground","Debug toolbar icon for pause.")),j=e("debugIcon.stopForeground",{dark:"#F48771",light:"#A1260D",hcDark:"#F48771",hcLight:"#A1260D"},c("debugIcon.stopForeground","Debug toolbar icon for stop.")),q=e("debugIcon.disconnectForeground",{dark:"#F48771",light:"#A1260D",hcDark:"#F48771",hcLight:"#A1260D"},c("debugIcon.disconnectForeground","Debug toolbar icon for disconnect.")),G=e("debugIcon.restartForeground",{dark:"#89D185",light:"#388A34",hcDark:"#89D185",hcLight:"#388A34"},c("debugIcon.restartForeground","Debug toolbar icon for restart.")),J=e("debugIcon.stepOverForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c("debugIcon.stepOverForeground","Debug toolbar icon for step over.")),M=e("debugIcon.stepIntoForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c("debugIcon.stepIntoForeground","Debug toolbar icon for step into.")),Q=e("debugIcon.stepOutForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c("debugIcon.stepOutForeground","Debug toolbar icon for step over.")),U=e("debugIcon.continueForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c("debugIcon.continueForeground","Debug toolbar icon for continue.")),X=e("debugIcon.stepBackForeground",{dark:"#75BEFF",light:"#007ACC",hcDark:"#75BEFF",hcLight:"#007ACC"},c("debugIcon.stepBackForeground","Debug toolbar icon for step back."));fo((o,t)=>{const g=o.getColor(ko),s=o.getColor(Co),Y=o.getColor(wo),i=o.getColor(T),b=o.getColor(R),Z=o.getColor(y),_=o.getColor(O),l=o.getColor(W),oo=o.getColor(mo);t.addRule(`
			/* Text colour of the call stack row's filename */
			.debug-pane .debug-call-stack .monaco-list-row:not(.selected) .stack-frame > .file .file-name {
				color: ${Y}
			}

			/* Line & column number "badge" for selected call stack row */
			.debug-pane .monaco-list-row.selected .line-number {
				background-color: ${g};
				color: ${s};
			}

			/* Line & column number "badge" for unselected call stack row (basically all other rows) */
			.debug-pane .line-number {
				background-color: ${g.transparent(.6)};
				color: ${s.transparent(.6)};
			}

			/* State "badge" displaying the active session's current state.
			* Only visible when there are more active debug sessions/threads running.
			*/
			.debug-pane .debug-call-stack .thread > .state.label,
			.debug-pane .debug-call-stack .session > .state.label {
				background-color: ${_};
				color: ${Z};
			}

			/* State "badge" displaying the active session's current state.
			* Only visible when there are more active debug sessions/threads running
			* and thread paused due to a thrown exception.
			*/
			.debug-pane .debug-call-stack .thread > .state.label.exception,
			.debug-pane .debug-call-stack .session > .state.label.exception {
				background-color: ${b};
				color: ${i};
			}

			/* Info "badge" shown when the debugger pauses due to a thrown exception. */
			.debug-pane .call-stack-state-message > .label.exception {
				background-color: ${b};
				color: ${i};
			}

			/* Animation of changed values in Debug viewlet */
			@keyframes debugViewletValueChanged {
				0%   { background-color: ${l.transparent(0)} }
				5%   { background-color: ${l.transparent(.9)} }
				100% { background-color: ${l.transparent(.3)} }
			}

			.debug-pane .monaco-list-row .expression .value.changed {
				background-color: ${l.transparent(.3)};
				animation-name: debugViewletValueChanged;
				animation-duration: 1s;
				animation-fill-mode: forwards;
			}

			.monaco-list-row .expression .lazy-button:hover {
				background-color: ${oo}
			}
		`);const h=o.getColor(So);h&&t.addRule(`
			.debug-pane .line-number {
				border: 1px solid ${h};
			}
			`),vo(o.type)&&t.addRule(`
			.debug-pane .line-number {
				background-color: ${g};
				color: ${s};
			}`);const eo=o.getColor(D),ro=o.getColor(x),no=o.getColor(L),to=o.getColor(B),ao=o.getColor(E),co=o.getColor(V),lo=o.getColor(A);t.addRule(`
			.monaco-workbench .monaco-list-row .expression .name {
				color: ${eo};
			}

			.monaco-workbench .monaco-list-row .expression .type {
				color: ${ro};
			}

			.monaco-workbench .monaco-list-row .expression .value,
			.monaco-workbench .debug-hover-widget .value {
				color: ${no};
			}

			.monaco-workbench .monaco-list-row .expression .value.string,
			.monaco-workbench .debug-hover-widget .value.string {
				color: ${to};
			}

			.monaco-workbench .monaco-list-row .expression .value.boolean,
			.monaco-workbench .debug-hover-widget .value.boolean {
				color: ${ao};
			}

			.monaco-workbench .monaco-list-row .expression .error,
			.monaco-workbench .debug-hover-widget .error,
			.monaco-workbench .debug-pane .debug-variables .scope .error {
				color: ${co};
			}

			.monaco-workbench .monaco-list-row .expression .value.number,
			.monaco-workbench .debug-hover-widget .value.number {
				color: ${lo};
			}
		`);const go=o.getColor(Fo)||$o.fromHex("#80808060"),so=o.getColor(P),uo=o.getColor(H),io=o.getColor(z),bo=o.getColor(K),ho=o.getColor(d);t.addRule(`
			.repl .repl-input-wrapper {
				border-top: 1px solid ${go};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.info {
				color: ${so};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.warn {
				color: ${uo};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.error {
				color: ${io};
			}

			.monaco-workbench .repl .repl-tree .output .expression .source {
				color: ${bo};
			}

			.monaco-workbench .repl .repl-tree .monaco-tl-contents .arrow {
				color: ${ho};
			}
		`),o.defines(d)||t.addRule(`
				.monaco-workbench.vs .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 0.25;
				}

				.monaco-workbench.vs-dark .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 0.4;
				}

				.monaco-workbench.hc-black .repl .repl-tree .monaco-tl-contents .arrow,
				.monaco-workbench.hc-light .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 1;
				}
			`);const p=o.getColor(Io);p&&t.addRule(`.monaco-workbench ${r.asCSSSelector(n.debugStart)} { color: ${p}; }`);const k=o.getColor(N);k&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugPause)}, .monaco-workbench ${r.asCSSSelector(n.debugPause)} { color: ${k}; }`);const C=o.getColor(j);C&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugStop)},.monaco-workbench ${r.asCSSSelector(n.debugStop)} { color: ${C}; }`);const w=o.getColor(q);w&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugDisconnect)},.monaco-workbench .debug-view-content ${r.asCSSSelector(n.debugDisconnect)}, .monaco-workbench .debug-toolbar ${r.asCSSSelector(n.debugDisconnect)}, .monaco-workbench .command-center-center ${r.asCSSSelector(n.debugDisconnect)} { color: ${w}; }`);const S=o.getColor(G);S&&t.addRule(`.monaco-workbench ${r.asCSSSelector(n.debugRestart)}, .monaco-workbench ${r.asCSSSelector(n.debugRestartFrame)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugRestart)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugRestartFrame)} { color: ${S}; }`);const F=o.getColor(J);F&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugStepOver)}, .monaco-workbench ${r.asCSSSelector(n.debugStepOver)} { color: ${F}; }`);const m=o.getColor(M);m&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugStepInto)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugStepInto)}, .monaco-workbench ${r.asCSSSelector(n.debugStepInto)} { color: ${m}; }`);const f=o.getColor(Q);f&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugStepOut)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugStepOut)}, .monaco-workbench ${r.asCSSSelector(n.debugStepOut)} { color: ${f}; }`);const $=o.getColor(U);$&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugContinue)}, .monaco-workbench ${r.asCSSSelector(n.debugContinue)}, .monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugReverseContinue)}, .monaco-workbench ${r.asCSSSelector(n.debugReverseContinue)} { color: ${$}; }`);const v=o.getColor(X);v&&t.addRule(`.monaco-workbench .part > .title > .title-actions .action-label${r.asCSSSelector(n.debugStepBack)}, .monaco-workbench ${r.asCSSSelector(n.debugStepBack)} { color: ${v}; }`)})}export{Io as debugIconStartForeground,Vo as debugToolBarBackground,To as debugToolBarBorder,Ro as registerColors};
