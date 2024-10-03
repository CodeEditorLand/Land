import { FileAccess, nodeModulesAsarPath, nodeModulesPath, Schemas, VSCODE_AUTHORITY } from './base/common/network.js';
import * as platform from './base/common/platform.js';
import { URI } from './base/common/uri.js';
import { generateUuid } from './base/common/uuid.js';
export const canASAR = false;
class DefineCall {
    constructor(id, dependencies, callback) {
        this.id = id;
        this.dependencies = dependencies;
        this.callback = callback;
    }
}
var AMDModuleImporterState;
(function (AMDModuleImporterState) {
    AMDModuleImporterState[AMDModuleImporterState["Uninitialized"] = 1] = "Uninitialized";
    AMDModuleImporterState[AMDModuleImporterState["InitializedInternal"] = 2] = "InitializedInternal";
    AMDModuleImporterState[AMDModuleImporterState["InitializedExternal"] = 3] = "InitializedExternal";
})(AMDModuleImporterState || (AMDModuleImporterState = {}));
class AMDModuleImporter {
    static { this.INSTANCE = new AMDModuleImporter(); }
    constructor() {
        this._isWebWorker = (typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope');
        this._isRenderer = typeof document === 'object';
        this._defineCalls = [];
        this._state = AMDModuleImporterState.Uninitialized;
    }
    _initialize() {
        if (this._state === AMDModuleImporterState.Uninitialized) {
            if (globalThis.define) {
                this._state = AMDModuleImporterState.InitializedExternal;
                return;
            }
        }
        else {
            return;
        }
        this._state = AMDModuleImporterState.InitializedInternal;
        globalThis.define = (id, dependencies, callback) => {
            if (typeof id !== 'string') {
                callback = dependencies;
                dependencies = id;
                id = null;
            }
            if (typeof dependencies !== 'object' || !Array.isArray(dependencies)) {
                callback = dependencies;
                dependencies = null;
            }
            this._defineCalls.push(new DefineCall(id, dependencies, callback));
        };
        globalThis.define.amd = true;
        if (this._isRenderer) {
            this._amdPolicy = globalThis._VSCODE_WEB_PACKAGE_TTP ?? window.trustedTypes?.createPolicy('amdLoader', {
                createScriptURL(value) {
                    if (value.startsWith(window.location.origin)) {
                        return value;
                    }
                    if (value.startsWith(`${Schemas.vscodeFileResource}://${VSCODE_AUTHORITY}`)) {
                        return value;
                    }
                    throw new Error(`[trusted_script_src] Invalid script url: ${value}`);
                }
            });
        }
        else if (this._isWebWorker) {
            this._amdPolicy = globalThis._VSCODE_WEB_PACKAGE_TTP ?? globalThis.trustedTypes?.createPolicy('amdLoader', {
                createScriptURL(value) {
                    return value;
                }
            });
        }
    }
    async load(scriptSrc) {
        this._initialize();
        if (this._state === AMDModuleImporterState.InitializedExternal) {
            return new Promise(resolve => {
                const tmpModuleId = generateUuid();
                globalThis.define(tmpModuleId, [scriptSrc], function (moduleResult) {
                    resolve(moduleResult);
                });
            });
        }
        const defineCall = await (this._isWebWorker ? this._workerLoadScript(scriptSrc) : this._isRenderer ? this._rendererLoadScript(scriptSrc) : this._nodeJSLoadScript(scriptSrc));
        if (!defineCall) {
            console.warn(`Did not receive a define call from script ${scriptSrc}`);
            return undefined;
        }
        const exports = {};
        const dependencyObjs = [];
        const dependencyModules = [];
        if (Array.isArray(defineCall.dependencies)) {
            for (const mod of defineCall.dependencies) {
                if (mod === 'exports') {
                    dependencyObjs.push(exports);
                }
                else {
                    dependencyModules.push(mod);
                }
            }
        }
        if (dependencyModules.length > 0) {
            throw new Error(`Cannot resolve dependencies for script ${scriptSrc}. The dependencies are: ${dependencyModules.join(', ')}`);
        }
        if (typeof defineCall.callback === 'function') {
            return defineCall.callback(...dependencyObjs) ?? exports;
        }
        else {
            return defineCall.callback;
        }
    }
    _rendererLoadScript(scriptSrc) {
        return new Promise((resolve, reject) => {
            const scriptElement = document.createElement('script');
            scriptElement.setAttribute('async', 'async');
            scriptElement.setAttribute('type', 'text/javascript');
            const unbind = () => {
                scriptElement.removeEventListener('load', loadEventListener);
                scriptElement.removeEventListener('error', errorEventListener);
            };
            const loadEventListener = (e) => {
                unbind();
                resolve(this._defineCalls.pop());
            };
            const errorEventListener = (e) => {
                unbind();
                reject(e);
            };
            scriptElement.addEventListener('load', loadEventListener);
            scriptElement.addEventListener('error', errorEventListener);
            if (this._amdPolicy) {
                scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
            }
            scriptElement.setAttribute('src', scriptSrc);
            window.document.getElementsByTagName('head')[0].appendChild(scriptElement);
        });
    }
    async _workerLoadScript(scriptSrc) {
        if (this._amdPolicy) {
            scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
        }
        await import(scriptSrc);
        return this._defineCalls.pop();
    }
    async _nodeJSLoadScript(scriptSrc) {
        try {
            const fs = (await import(`${'fs'}`)).default;
            const vm = (await import(`${'vm'}`)).default;
            const module = (await import(`${'module'}`)).default;
            const filePath = URI.parse(scriptSrc).fsPath;
            const content = fs.readFileSync(filePath).toString();
            const scriptSource = module.wrap(content.replace(/^#!.*/, ''));
            const script = new vm.Script(scriptSource);
            const compileWrapper = script.runInThisContext();
            compileWrapper.apply();
            return this._defineCalls.pop();
        }
        catch (error) {
            throw error;
        }
    }
}
const cache = new Map();
export async function importAMDNodeModule(nodeModuleName, pathInsideNodeModule, isBuilt) {
    if (isBuilt === undefined) {
        const product = globalThis._VSCODE_PRODUCT_JSON;
        isBuilt = Boolean((product ?? globalThis.vscode?.context?.configuration()?.product)?.commit);
    }
    const nodeModulePath = pathInsideNodeModule ? `${nodeModuleName}/${pathInsideNodeModule}` : nodeModuleName;
    if (cache.has(nodeModulePath)) {
        return cache.get(nodeModulePath);
    }
    let scriptSrc;
    if (/^\w[\w\d+.-]*:\/\//.test(nodeModulePath)) {
        scriptSrc = nodeModulePath;
    }
    else {
        const useASAR = (canASAR && isBuilt && !platform.isWeb);
        const actualNodeModulesPath = (useASAR ? nodeModulesAsarPath : nodeModulesPath);
        const resourcePath = `${actualNodeModulesPath}/${nodeModulePath}`;
        scriptSrc = FileAccess.asBrowserUri(resourcePath).toString(true);
    }
    const result = AMDModuleImporter.INSTANCE.load(scriptSrc);
    cache.set(nodeModulePath, result);
    return result;
}
export function resolveAmdNodeModulePath(nodeModuleName, pathInsideNodeModule) {
    const product = globalThis._VSCODE_PRODUCT_JSON;
    const isBuilt = Boolean((product ?? globalThis.vscode?.context?.configuration()?.product)?.commit);
    const useASAR = (canASAR && isBuilt && !platform.isWeb);
    const nodeModulePath = `${nodeModuleName}/${pathInsideNodeModule}`;
    const actualNodeModulesPath = (useASAR ? nodeModulesAsarPath : nodeModulesPath);
    const resourcePath = `${actualNodeModulesPath}/${nodeModulePath}`;
    return FileAccess.asBrowserUri(resourcePath).toString(true);
}
