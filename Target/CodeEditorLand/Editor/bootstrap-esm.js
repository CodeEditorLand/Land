import*as n from"path";import*as o from"fs";import{fileURLToPath as l}from"url";import{createRequire as f,register as u}from"node:module";import{product as c,pkg as d}from"./bootstrap-meta.js";import"./bootstrap-node.js";import*as s from"./vs/base/common/performance.js";import"./vs/nls.js";const g=f(import.meta.url),S=n.dirname(l(import.meta.url));if((process.env.ELECTRON_RUN_AS_NODE||process.versions.electron)&&u(`data:text/javascript;base64,${Buffer.from(`
	export async function resolve(specifier, context, nextResolve) {
		if (specifier === 'fs') {
			return {
				format: 'builtin',
				shortCircuit: true,
				url: 'node:original-fs'
			};
		}

		// Defer to the next hook in the chain, which would be the
		// Node.js default resolve if this is the last user-specified loader.
		return nextResolve(specifier, context);
	}`).toString("base64")}`,import.meta.url),globalThis._VSCODE_PRODUCT_JSON={...c},process.env.VSCODE_DEV)try{const e=g("../product.overrides.json");globalThis._VSCODE_PRODUCT_JSON=Object.assign(globalThis._VSCODE_PRODUCT_JSON,e)}catch{}globalThis._VSCODE_PACKAGE_JSON={...d},globalThis._VSCODE_FILE_ROOT=S;let i;function m(){return i||(i=p()),i}async function p(){s.mark("code/willLoadNls");let e,r;if(process.env.VSCODE_NLS_CONFIG)try{e=JSON.parse(process.env.VSCODE_NLS_CONFIG),e?.languagePack?.messagesFile?r=e.languagePack.messagesFile:e?.defaultMessagesFile&&(r=e.defaultMessagesFile),globalThis._VSCODE_NLS_LANGUAGE=e?.resolvedLanguage}catch{}if(!(process.env.VSCODE_DEV||!r)){try{globalThis._VSCODE_NLS_MESSAGES=JSON.parse((await o.promises.readFile(r)).toString())}catch{if(e?.languagePack?.corruptMarkerFile)try{await o.promises.writeFile(e.languagePack.corruptMarkerFile,"corrupted")}catch{}if(e?.defaultMessagesFile&&e.defaultMessagesFile!==r)try{globalThis._VSCODE_NLS_MESSAGES=JSON.parse((await o.promises.readFile(e.defaultMessagesFile)).toString())}catch{}}return s.mark("code/didLoadNls"),e}}async function L(){await m()}export{L as bootstrapESM};
