var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { env } from '../../../../base/common/process.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { LRUCache } from '../../../../base/common/map.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { FileOperationError, IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { URI } from '../../../../base/common/uri.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { Schemas } from '../../../../base/common/network.js';
import { isWindows } from '../../../../base/common/platform.js';
import { join } from '../../../../base/common/path.js';
let commandHistory = undefined;
export function getCommandHistory(accessor) {
    if (!commandHistory) {
        commandHistory = accessor.get(IInstantiationService).createInstance(TerminalPersistedHistory, 'commands');
    }
    return commandHistory;
}
let directoryHistory = undefined;
export function getDirectoryHistory(accessor) {
    if (!directoryHistory) {
        directoryHistory = accessor.get(IInstantiationService).createInstance(TerminalPersistedHistory, 'dirs');
    }
    return directoryHistory;
}
const shellFileHistory = new Map();
export async function getShellFileHistory(accessor, shellType) {
    const cached = shellFileHistory.get(shellType);
    if (cached === null) {
        return [];
    }
    if (cached !== undefined) {
        return cached;
    }
    let result;
    switch (shellType) {
        case "bash":
            result = await fetchBashHistory(accessor);
            break;
        case "pwsh":
            result = await fetchPwshHistory(accessor);
            break;
        case "zsh":
            result = await fetchZshHistory(accessor);
            break;
        case "fish":
            result = await fetchFishHistory(accessor);
            break;
        case "python":
            result = await fetchPythonHistory(accessor);
            break;
        default: return [];
    }
    if (result === undefined) {
        shellFileHistory.set(shellType, null);
        return [];
    }
    const array = Array.from(result);
    shellFileHistory.set(shellType, array);
    return array;
}
export function clearShellFileHistory() {
    shellFileHistory.clear();
}
let TerminalPersistedHistory = class TerminalPersistedHistory extends Disposable {
    get entries() {
        this._ensureUpToDate();
        return this._entries.entries();
    }
    constructor(_storageDataKey, _configurationService, _storageService) {
        super();
        this._storageDataKey = _storageDataKey;
        this._configurationService = _configurationService;
        this._storageService = _storageService;
        this._timestamp = 0;
        this._isReady = false;
        this._isStale = true;
        this._entries = new LRUCache(this._getHistoryLimit());
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.shellIntegration.history")) {
                this._entries.limit = this._getHistoryLimit();
            }
        }));
        this._register(this._storageService.onDidChangeValue(-1, this._getTimestampStorageKey(), this._store)(() => {
            if (!this._isStale) {
                this._isStale = this._storageService.getNumber(this._getTimestampStorageKey(), -1, 0) !== this._timestamp;
            }
        }));
    }
    add(key, value) {
        this._ensureUpToDate();
        this._entries.set(key, value);
        this._saveState();
    }
    remove(key) {
        this._ensureUpToDate();
        this._entries.delete(key);
        this._saveState();
    }
    clear() {
        this._ensureUpToDate();
        this._entries.clear();
        this._saveState();
    }
    _ensureUpToDate() {
        if (!this._isReady) {
            this._loadState();
            this._isReady = true;
        }
        if (this._isStale) {
            this._entries.clear();
            this._loadState();
            this._isStale = false;
        }
    }
    _loadState() {
        this._timestamp = this._storageService.getNumber(this._getTimestampStorageKey(), -1, 0);
        const serialized = this._loadPersistedState();
        if (serialized) {
            for (const entry of serialized.entries) {
                this._entries.set(entry.key, entry.value);
            }
        }
    }
    _loadPersistedState() {
        const raw = this._storageService.get(this._getEntriesStorageKey(), -1);
        if (raw === undefined || raw.length === 0) {
            return undefined;
        }
        let serialized = undefined;
        try {
            serialized = JSON.parse(raw);
        }
        catch {
            return undefined;
        }
        return serialized;
    }
    _saveState() {
        const serialized = { entries: [] };
        this._entries.forEach((value, key) => serialized.entries.push({ key, value }));
        this._storageService.store(this._getEntriesStorageKey(), JSON.stringify(serialized), -1, 1);
        this._timestamp = Date.now();
        this._storageService.store(this._getTimestampStorageKey(), this._timestamp, -1, 1);
    }
    _getHistoryLimit() {
        const historyLimit = this._configurationService.getValue("terminal.integrated.shellIntegration.history");
        return typeof historyLimit === 'number' ? historyLimit : 100;
    }
    _getTimestampStorageKey() {
        return `${"terminal.history.timestamp"}.${this._storageDataKey}`;
    }
    _getEntriesStorageKey() {
        return `${"terminal.history.entries"}.${this._storageDataKey}`;
    }
};
TerminalPersistedHistory = __decorate([
    __param(1, IConfigurationService),
    __param(2, IStorageService),
    __metadata("design:paramtypes", [String, Object, Object])
], TerminalPersistedHistory);
export { TerminalPersistedHistory };
export async function fetchBashHistory(accessor) {
    const fileService = accessor.get(IFileService);
    const remoteAgentService = accessor.get(IRemoteAgentService);
    const remoteEnvironment = await remoteAgentService.getEnvironment();
    if (remoteEnvironment?.os === 1 || !remoteEnvironment && isWindows) {
        return undefined;
    }
    const content = await fetchFileContents(env['HOME'], '.bash_history', false, fileService, remoteAgentService);
    if (content === undefined) {
        return undefined;
    }
    const fileLines = content.split('\n');
    const result = new Set();
    let currentLine;
    let currentCommand = undefined;
    let wrapChar = undefined;
    for (let i = 0; i < fileLines.length; i++) {
        currentLine = fileLines[i];
        if (currentCommand === undefined) {
            currentCommand = currentLine;
        }
        else {
            currentCommand += `\n${currentLine}`;
        }
        for (let c = 0; c < currentLine.length; c++) {
            if (wrapChar) {
                if (currentLine[c] === wrapChar) {
                    wrapChar = undefined;
                }
            }
            else {
                if (currentLine[c].match(/['"]/)) {
                    wrapChar = currentLine[c];
                }
            }
        }
        if (wrapChar === undefined) {
            if (currentCommand.length > 0) {
                result.add(currentCommand.trim());
            }
            currentCommand = undefined;
        }
    }
    return result.values();
}
export async function fetchZshHistory(accessor) {
    const fileService = accessor.get(IFileService);
    const remoteAgentService = accessor.get(IRemoteAgentService);
    const remoteEnvironment = await remoteAgentService.getEnvironment();
    if (remoteEnvironment?.os === 1 || !remoteEnvironment && isWindows) {
        return undefined;
    }
    const content = await fetchFileContents(env['HOME'], '.zsh_history', false, fileService, remoteAgentService);
    if (content === undefined) {
        return undefined;
    }
    const fileLines = content.split(/\:\s\d+\:\d+;/);
    const result = new Set();
    for (let i = 0; i < fileLines.length; i++) {
        const sanitized = fileLines[i].replace(/\\\n/g, '\n').trim();
        if (sanitized.length > 0) {
            result.add(sanitized);
        }
    }
    return result.values();
}
export async function fetchPythonHistory(accessor) {
    const fileService = accessor.get(IFileService);
    const remoteAgentService = accessor.get(IRemoteAgentService);
    const content = await fetchFileContents(env['HOME'], '.python_history', false, fileService, remoteAgentService);
    if (content === undefined) {
        return undefined;
    }
    const fileLines = content.split('\n');
    const result = new Set();
    fileLines.forEach(line => {
        if (line.trim().length > 0) {
            result.add(line.trim());
        }
    });
    return result.values();
}
export async function fetchPwshHistory(accessor) {
    const fileService = accessor.get(IFileService);
    const remoteAgentService = accessor.get(IRemoteAgentService);
    let folderPrefix;
    let filePath;
    const remoteEnvironment = await remoteAgentService.getEnvironment();
    const isFileWindows = remoteEnvironment?.os === 1 || !remoteEnvironment && isWindows;
    if (isFileWindows) {
        folderPrefix = env['APPDATA'];
        filePath = 'Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt';
    }
    else {
        folderPrefix = env['HOME'];
        filePath = '.local/share/powershell/PSReadline/ConsoleHost_history.txt';
    }
    const content = await fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService);
    if (content === undefined) {
        return undefined;
    }
    const fileLines = content.split('\n');
    const result = new Set();
    let currentLine;
    let currentCommand = undefined;
    let wrapChar = undefined;
    for (let i = 0; i < fileLines.length; i++) {
        currentLine = fileLines[i];
        if (currentCommand === undefined) {
            currentCommand = currentLine;
        }
        else {
            currentCommand += `\n${currentLine}`;
        }
        if (!currentLine.endsWith('`')) {
            const sanitized = currentCommand.trim();
            if (sanitized.length > 0) {
                result.add(sanitized);
            }
            currentCommand = undefined;
            continue;
        }
        for (let c = 0; c < currentLine.length; c++) {
            if (wrapChar) {
                if (currentLine[c] === wrapChar) {
                    wrapChar = undefined;
                }
            }
            else {
                if (currentLine[c].match(/`/)) {
                    wrapChar = currentLine[c];
                }
            }
        }
        if (!wrapChar) {
            const sanitized = currentCommand.trim();
            if (sanitized.length > 0) {
                result.add(sanitized);
            }
            currentCommand = undefined;
        }
        else {
            currentCommand = currentCommand.replace(/`$/, '');
            wrapChar = undefined;
        }
    }
    return result.values();
}
export async function fetchFishHistory(accessor) {
    const fileService = accessor.get(IFileService);
    const remoteAgentService = accessor.get(IRemoteAgentService);
    const remoteEnvironment = await remoteAgentService.getEnvironment();
    if (remoteEnvironment?.os === 1 || !remoteEnvironment && isWindows) {
        return undefined;
    }
    const overridenDataHome = env['XDG_DATA_HOME'];
    const content = await (overridenDataHome
        ? fetchFileContents(env['XDG_DATA_HOME'], 'fish/fish_history', false, fileService, remoteAgentService)
        : fetchFileContents(env['HOME'], '.local/share/fish/fish_history', false, fileService, remoteAgentService));
    if (content === undefined) {
        return undefined;
    }
    const result = new Set();
    const cmds = content.split('\n')
        .filter(x => x.startsWith('- cmd:'))
        .map(x => x.substring(6).trimStart());
    for (let i = 0; i < cmds.length; i++) {
        const sanitized = sanitizeFishHistoryCmd(cmds[i]).trim();
        if (sanitized.length > 0) {
            result.add(sanitized);
        }
    }
    return result.values();
}
export function sanitizeFishHistoryCmd(cmd) {
    return repeatedReplace(/(^|[^\\])((?:\\\\)*)(\\n)/g, cmd, '$1$2\n');
}
function repeatedReplace(pattern, value, replaceValue) {
    let last;
    let current = value;
    while (true) {
        last = current;
        current = current.replace(pattern, replaceValue);
        if (current === last) {
            return current;
        }
    }
}
async function fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService) {
    if (!folderPrefix) {
        return undefined;
    }
    const connection = remoteAgentService.getConnection();
    const isRemote = !!connection?.remoteAuthority;
    const historyFileUri = URI.from({
        scheme: isRemote ? Schemas.vscodeRemote : Schemas.file,
        authority: isRemote ? connection.remoteAuthority : undefined,
        path: URI.file(join(folderPrefix, filePath)).path
    });
    let content;
    try {
        content = await fileService.readFile(historyFileUri);
    }
    catch (e) {
        if (e instanceof FileOperationError && e.fileOperationResult === 1) {
            return undefined;
        }
        throw e;
    }
    if (content === undefined) {
        return undefined;
    }
    return content.value.toString();
}
