/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ErrorNoTelemetry } from '../../../../base/common/errors.js';
export const IConfigurationResolverService = createDecorator('configurationResolverService');
export var VariableKind;
(function (VariableKind) {
    VariableKind["Unknown"] = "unknown";
    VariableKind["Env"] = "env";
    VariableKind["Config"] = "config";
    VariableKind["Command"] = "command";
    VariableKind["Input"] = "input";
    VariableKind["ExtensionInstallFolder"] = "extensionInstallFolder";
    VariableKind["WorkspaceFolder"] = "workspaceFolder";
    VariableKind["Cwd"] = "cwd";
    VariableKind["WorkspaceFolderBasename"] = "workspaceFolderBasename";
    VariableKind["UserHome"] = "userHome";
    VariableKind["LineNumber"] = "lineNumber";
    VariableKind["SelectedText"] = "selectedText";
    VariableKind["File"] = "file";
    VariableKind["FileWorkspaceFolder"] = "fileWorkspaceFolder";
    VariableKind["FileWorkspaceFolderBasename"] = "fileWorkspaceFolderBasename";
    VariableKind["RelativeFile"] = "relativeFile";
    VariableKind["RelativeFileDirname"] = "relativeFileDirname";
    VariableKind["FileDirname"] = "fileDirname";
    VariableKind["FileExtname"] = "fileExtname";
    VariableKind["FileBasename"] = "fileBasename";
    VariableKind["FileBasenameNoExtension"] = "fileBasenameNoExtension";
    VariableKind["FileDirnameBasename"] = "fileDirnameBasename";
    VariableKind["ExecPath"] = "execPath";
    VariableKind["ExecInstallFolder"] = "execInstallFolder";
    VariableKind["PathSeparator"] = "pathSeparator";
    VariableKind["PathSeparatorAlias"] = "/";
})(VariableKind || (VariableKind = {}));
export class VariableError extends ErrorNoTelemetry {
    constructor(variable, message) {
        super(message);
        this.variable = variable;
    }
}
