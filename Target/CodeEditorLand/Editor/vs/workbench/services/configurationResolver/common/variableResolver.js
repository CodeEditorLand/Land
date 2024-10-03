import * as paths from '../../../../base/common/path.js';
import * as process from '../../../../base/common/process.js';
import * as types from '../../../../base/common/types.js';
import * as objects from '../../../../base/common/objects.js';
import { isWindows, isMacintosh, isLinux } from '../../../../base/common/platform.js';
import { normalizeDriveLetter } from '../../../../base/common/labels.js';
import { localize } from '../../../../nls.js';
import { VariableError, VariableKind } from './configurationResolver.js';
import { replaceAsync } from '../../../../base/common/strings.js';
export class AbstractVariableResolverService {
    static { this.VARIABLE_LHS = '${'; }
    static { this.VARIABLE_REGEXP = /\$\{(.*?)\}/g; }
    constructor(_context, _labelService, _userHomePromise, _envVariablesPromise) {
        this._contributedVariables = new Map();
        this._context = _context;
        this._labelService = _labelService;
        this._userHomePromise = _userHomePromise;
        if (_envVariablesPromise) {
            this._envVariablesPromise = _envVariablesPromise.then(envVariables => {
                return this.prepareEnv(envVariables);
            });
        }
    }
    prepareEnv(envVariables) {
        if (isWindows) {
            const ev = Object.create(null);
            Object.keys(envVariables).forEach(key => {
                ev[key.toLowerCase()] = envVariables[key];
            });
            return ev;
        }
        return envVariables;
    }
    resolveWithEnvironment(environment, root, value) {
        return this.recursiveResolve({ env: this.prepareEnv(environment), userHome: undefined }, root ? root.uri : undefined, value);
    }
    async resolveAsync(root, value) {
        const environment = {
            env: await this._envVariablesPromise,
            userHome: await this._userHomePromise
        };
        return this.recursiveResolve(environment, root ? root.uri : undefined, value);
    }
    async resolveAnyBase(workspaceFolder, config, commandValueMapping, resolvedVariables) {
        const result = objects.deepClone(config);
        if (isWindows && result.windows) {
            Object.keys(result.windows).forEach(key => result[key] = result.windows[key]);
        }
        else if (isMacintosh && result.osx) {
            Object.keys(result.osx).forEach(key => result[key] = result.osx[key]);
        }
        else if (isLinux && result.linux) {
            Object.keys(result.linux).forEach(key => result[key] = result.linux[key]);
        }
        delete result.windows;
        delete result.osx;
        delete result.linux;
        const environmentPromises = {
            env: await this._envVariablesPromise,
            userHome: await this._userHomePromise
        };
        return this.recursiveResolve(environmentPromises, workspaceFolder ? workspaceFolder.uri : undefined, result, commandValueMapping, resolvedVariables);
    }
    async resolveAnyAsync(workspaceFolder, config, commandValueMapping) {
        return this.resolveAnyBase(workspaceFolder, config, commandValueMapping);
    }
    async resolveAnyMap(workspaceFolder, config, commandValueMapping) {
        const resolvedVariables = new Map();
        const newConfig = await this.resolveAnyBase(workspaceFolder, config, commandValueMapping, resolvedVariables);
        return { newConfig, resolvedVariables };
    }
    resolveWithInteractionReplace(folder, config, section, variables) {
        throw new Error('resolveWithInteractionReplace not implemented.');
    }
    resolveWithInteraction(folder, config, section, variables) {
        throw new Error('resolveWithInteraction not implemented.');
    }
    contributeVariable(variable, resolution) {
        if (this._contributedVariables.has(variable)) {
            throw new Error('Variable ' + variable + ' is contributed twice.');
        }
        else {
            this._contributedVariables.set(variable, resolution);
        }
    }
    async recursiveResolve(environment, folderUri, value, commandValueMapping, resolvedVariables) {
        if (types.isString(value)) {
            return this.resolveString(environment, folderUri, value, commandValueMapping, resolvedVariables);
        }
        else if (Array.isArray(value)) {
            return Promise.all(value.map(s => this.recursiveResolve(environment, folderUri, s, commandValueMapping, resolvedVariables)));
        }
        else if (types.isObject(value)) {
            const result = Object.create(null);
            const replaced = await Promise.all(Object.keys(value).map(async (key) => {
                const replaced = await this.resolveString(environment, folderUri, key, commandValueMapping, resolvedVariables);
                return [replaced, await this.recursiveResolve(environment, folderUri, value[key], commandValueMapping, resolvedVariables)];
            }));
            for (const [key, value] of replaced) {
                result[key] = value;
            }
            return result;
        }
        return value;
    }
    resolveString(environment, folderUri, value, commandValueMapping, resolvedVariables) {
        return replaceAsync(value, AbstractVariableResolverService.VARIABLE_REGEXP, async (match, variable) => {
            if (variable.includes(AbstractVariableResolverService.VARIABLE_LHS)) {
                return match;
            }
            let resolvedValue = await this.evaluateSingleVariable(environment, match, variable, folderUri, commandValueMapping);
            resolvedVariables?.set(variable, resolvedValue);
            if ((resolvedValue !== match) && types.isString(resolvedValue) && resolvedValue.match(AbstractVariableResolverService.VARIABLE_REGEXP)) {
                resolvedValue = await this.resolveString(environment, folderUri, resolvedValue, commandValueMapping, resolvedVariables);
            }
            return resolvedValue;
        });
    }
    fsPath(displayUri) {
        return this._labelService ? this._labelService.getUriLabel(displayUri, { noPrefix: true }) : displayUri.fsPath;
    }
    async evaluateSingleVariable(environment, match, variable, folderUri, commandValueMapping) {
        let argument;
        const parts = variable.split(':');
        if (parts.length > 1) {
            variable = parts[0];
            argument = parts[1];
        }
        const getFilePath = (variableKind) => {
            const filePath = this._context.getFilePath();
            if (filePath) {
                return normalizeDriveLetter(filePath);
            }
            throw new VariableError(variableKind, (localize('canNotResolveFile', "Variable {0} can not be resolved. Please open an editor.", match)));
        };
        const getFolderPathForFile = (variableKind) => {
            const filePath = getFilePath(variableKind);
            if (this._context.getWorkspaceFolderPathForFile) {
                const folderPath = this._context.getWorkspaceFolderPathForFile();
                if (folderPath) {
                    return normalizeDriveLetter(folderPath);
                }
            }
            throw new VariableError(variableKind, localize('canNotResolveFolderForFile', "Variable {0}: can not find workspace folder of '{1}'.", match, paths.basename(filePath)));
        };
        const getFolderUri = (variableKind) => {
            if (argument) {
                const folder = this._context.getFolderUri(argument);
                if (folder) {
                    return folder;
                }
                throw new VariableError(variableKind, localize('canNotFindFolder', "Variable {0} can not be resolved. No such folder '{1}'.", match, argument));
            }
            if (folderUri) {
                return folderUri;
            }
            if (this._context.getWorkspaceFolderCount() > 1) {
                throw new VariableError(variableKind, localize('canNotResolveWorkspaceFolderMultiRoot', "Variable {0} can not be resolved in a multi folder workspace. Scope this variable using ':' and a workspace folder name.", match));
            }
            throw new VariableError(variableKind, localize('canNotResolveWorkspaceFolder', "Variable {0} can not be resolved. Please open a folder.", match));
        };
        switch (variable) {
            case 'env':
                if (argument) {
                    if (environment.env) {
                        const env = environment.env[isWindows ? argument.toLowerCase() : argument];
                        if (types.isString(env)) {
                            return env;
                        }
                    }
                    return '';
                }
                throw new VariableError(VariableKind.Env, localize('missingEnvVarName', "Variable {0} can not be resolved because no environment variable name is given.", match));
            case 'config':
                if (argument) {
                    const config = this._context.getConfigurationValue(folderUri, argument);
                    if (types.isUndefinedOrNull(config)) {
                        throw new VariableError(VariableKind.Config, localize('configNotFound', "Variable {0} can not be resolved because setting '{1}' not found.", match, argument));
                    }
                    if (types.isObject(config)) {
                        throw new VariableError(VariableKind.Config, localize('configNoString', "Variable {0} can not be resolved because '{1}' is a structured value.", match, argument));
                    }
                    return config;
                }
                throw new VariableError(VariableKind.Config, localize('missingConfigName', "Variable {0} can not be resolved because no settings name is given.", match));
            case 'command':
                return this.resolveFromMap(VariableKind.Command, match, argument, commandValueMapping, 'command');
            case 'input':
                return this.resolveFromMap(VariableKind.Input, match, argument, commandValueMapping, 'input');
            case 'extensionInstallFolder':
                if (argument) {
                    const ext = await this._context.getExtension(argument);
                    if (!ext) {
                        throw new VariableError(VariableKind.ExtensionInstallFolder, localize('extensionNotInstalled', "Variable {0} can not be resolved because the extension {1} is not installed.", match, argument));
                    }
                    return this.fsPath(ext.extensionLocation);
                }
                throw new VariableError(VariableKind.ExtensionInstallFolder, localize('missingExtensionName', "Variable {0} can not be resolved because no extension name is given.", match));
            default: {
                switch (variable) {
                    case 'workspaceRoot':
                    case 'workspaceFolder':
                        return normalizeDriveLetter(this.fsPath(getFolderUri(VariableKind.WorkspaceFolder)));
                    case 'cwd':
                        return ((folderUri || argument) ? normalizeDriveLetter(this.fsPath(getFolderUri(VariableKind.Cwd))) : process.cwd());
                    case 'workspaceRootFolderName':
                    case 'workspaceFolderBasename':
                        return normalizeDriveLetter(paths.basename(this.fsPath(getFolderUri(VariableKind.WorkspaceFolderBasename))));
                    case 'userHome': {
                        if (environment.userHome) {
                            return environment.userHome;
                        }
                        throw new VariableError(VariableKind.UserHome, localize('canNotResolveUserHome', "Variable {0} can not be resolved. UserHome path is not defined", match));
                    }
                    case 'lineNumber': {
                        const lineNumber = this._context.getLineNumber();
                        if (lineNumber) {
                            return lineNumber;
                        }
                        throw new VariableError(VariableKind.LineNumber, localize('canNotResolveLineNumber', "Variable {0} can not be resolved. Make sure to have a line selected in the active editor.", match));
                    }
                    case 'selectedText': {
                        const selectedText = this._context.getSelectedText();
                        if (selectedText) {
                            return selectedText;
                        }
                        throw new VariableError(VariableKind.SelectedText, localize('canNotResolveSelectedText', "Variable {0} can not be resolved. Make sure to have some text selected in the active editor.", match));
                    }
                    case 'file':
                        return getFilePath(VariableKind.File);
                    case 'fileWorkspaceFolder':
                        return getFolderPathForFile(VariableKind.FileWorkspaceFolder);
                    case 'fileWorkspaceFolderBasename':
                        return paths.basename(getFolderPathForFile(VariableKind.FileWorkspaceFolderBasename));
                    case 'relativeFile':
                        if (folderUri || argument) {
                            return paths.relative(this.fsPath(getFolderUri(VariableKind.RelativeFile)), getFilePath(VariableKind.RelativeFile));
                        }
                        return getFilePath(VariableKind.RelativeFile);
                    case 'relativeFileDirname': {
                        const dirname = paths.dirname(getFilePath(VariableKind.RelativeFileDirname));
                        if (folderUri || argument) {
                            const relative = paths.relative(this.fsPath(getFolderUri(VariableKind.RelativeFileDirname)), dirname);
                            return relative.length === 0 ? '.' : relative;
                        }
                        return dirname;
                    }
                    case 'fileDirname':
                        return paths.dirname(getFilePath(VariableKind.FileDirname));
                    case 'fileExtname':
                        return paths.extname(getFilePath(VariableKind.FileExtname));
                    case 'fileBasename':
                        return paths.basename(getFilePath(VariableKind.FileBasename));
                    case 'fileBasenameNoExtension': {
                        const basename = paths.basename(getFilePath(VariableKind.FileBasenameNoExtension));
                        return (basename.slice(0, basename.length - paths.extname(basename).length));
                    }
                    case 'fileDirnameBasename':
                        return paths.basename(paths.dirname(getFilePath(VariableKind.FileDirnameBasename)));
                    case 'execPath': {
                        const ep = this._context.getExecPath();
                        if (ep) {
                            return ep;
                        }
                        return match;
                    }
                    case 'execInstallFolder': {
                        const ar = this._context.getAppRoot();
                        if (ar) {
                            return ar;
                        }
                        return match;
                    }
                    case 'pathSeparator':
                    case '/':
                        return paths.sep;
                    default:
                        try {
                            const key = argument ? `${variable}:${argument}` : variable;
                            return this.resolveFromMap(VariableKind.Unknown, match, key, commandValueMapping, undefined);
                        }
                        catch (error) {
                            return match;
                        }
                }
            }
        }
    }
    resolveFromMap(variableKind, match, argument, commandValueMapping, prefix) {
        if (argument && commandValueMapping) {
            const v = (prefix === undefined) ? commandValueMapping[argument] : commandValueMapping[prefix + ':' + argument];
            if (typeof v === 'string') {
                return v;
            }
            throw new VariableError(variableKind, localize('noValueForCommand', "Variable {0} can not be resolved because the command has no value.", match));
        }
        return match;
    }
}
