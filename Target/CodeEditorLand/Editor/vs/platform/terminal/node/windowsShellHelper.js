/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { timeout } from '../../../base/common/async.js';
import { debounce } from '../../../base/common/decorators.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { isWindows, platform } from '../../../base/common/platform.js';
const SHELL_EXECUTABLES = [
    'cmd.exe',
    'powershell.exe',
    'pwsh.exe',
    'bash.exe',
    'wsl.exe',
    'ubuntu.exe',
    'ubuntu1804.exe',
    'kali.exe',
    'debian.exe',
    'opensuse-42.exe',
    'sles-12.exe'
];
let windowsProcessTree;
export class WindowsShellHelper extends Disposable {
    get shellType() { return this._shellType; }
    get shellTitle() { return this._shellTitle; }
    get onShellNameChanged() { return this._onShellNameChanged.event; }
    get onShellTypeChanged() { return this._onShellTypeChanged.event; }
    constructor(_rootProcessId) {
        super();
        this._rootProcessId = _rootProcessId;
        this._shellTitle = '';
        this._onShellNameChanged = new Emitter();
        this._onShellTypeChanged = new Emitter();
        if (!isWindows) {
            throw new Error(`WindowsShellHelper cannot be instantiated on ${platform}`);
        }
        this._startMonitoringShell();
    }
    async _startMonitoringShell() {
        if (this._store.isDisposed) {
            return;
        }
        this.checkShell();
    }
    async checkShell() {
        if (isWindows) {
            // Wait to give the shell some time to actually launch a process, this
            // could lead to a race condition but it would be recovered from when
            // data stops and should cover the majority of cases
            await timeout(300);
            this.getShellName().then(title => {
                const type = this.getShellType(title);
                if (type !== this._shellType) {
                    this._onShellTypeChanged.fire(type);
                    this._onShellNameChanged.fire(title);
                    this._shellType = type;
                    this._shellTitle = title;
                }
            });
        }
    }
    traverseTree(tree) {
        if (!tree) {
            return '';
        }
        if (SHELL_EXECUTABLES.indexOf(tree.name) === -1) {
            return tree.name;
        }
        if (!tree.children || tree.children.length === 0) {
            return tree.name;
        }
        let favouriteChild = 0;
        for (; favouriteChild < tree.children.length; favouriteChild++) {
            const child = tree.children[favouriteChild];
            if (!child.children || child.children.length === 0) {
                break;
            }
            if (child.children[0].name !== 'conhost.exe') {
                break;
            }
        }
        if (favouriteChild >= tree.children.length) {
            return tree.name;
        }
        return this.traverseTree(tree.children[favouriteChild]);
    }
    /**
     * Returns the innermost shell executable running in the terminal
     */
    async getShellName() {
        if (this._store.isDisposed) {
            return Promise.resolve('');
        }
        // Prevent multiple requests at once, instead return current request
        if (this._currentRequest) {
            return this._currentRequest;
        }
        if (!windowsProcessTree) {
            windowsProcessTree = await import('@vscode/windows-process-tree');
        }
        this._currentRequest = new Promise(resolve => {
            windowsProcessTree.getProcessTree(this._rootProcessId, tree => {
                const name = this.traverseTree(tree);
                this._currentRequest = undefined;
                resolve(name);
            });
        });
        return this._currentRequest;
    }
    getShellType(executable) {
        switch (executable.toLowerCase()) {
            case 'cmd.exe':
                return "cmd" /* WindowsShellType.CommandPrompt */;
            case 'powershell.exe':
            case 'pwsh.exe':
                return "pwsh" /* GeneralShellType.PowerShell */;
            case 'bash.exe':
            case 'git-cmd.exe':
                return "gitbash" /* WindowsShellType.GitBash */;
            case 'julialauncher.exe':
                return "julia" /* GeneralShellType.Julia */;
            case 'nu.exe':
                return "nu" /* GeneralShellType.NuShell */;
            case 'wsl.exe':
            case 'ubuntu.exe':
            case 'ubuntu1804.exe':
            case 'kali.exe':
            case 'debian.exe':
            case 'opensuse-42.exe':
            case 'sles-12.exe':
                return "wsl" /* WindowsShellType.Wsl */;
            default:
                if (executable.match(/python(\d(\.\d{0,2})?)?\.exe/)) {
                    return "python" /* GeneralShellType.Python */;
                }
                return undefined;
        }
    }
}
__decorate([
    debounce(500),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WindowsShellHelper.prototype, "checkShell", null);
