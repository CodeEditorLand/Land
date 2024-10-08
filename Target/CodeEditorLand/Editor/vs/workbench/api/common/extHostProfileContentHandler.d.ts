import { CancellationToken } from '../../../base/common/cancellation.js';
import { UriComponents } from '../../../base/common/uri.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ISaveProfileResult } from '../../services/userDataProfile/common/userDataProfile.js';
import type * as vscode from 'vscode';
import { ExtHostProfileContentHandlersShape, IMainContext } from './extHost.protocol.js';
export declare class ExtHostProfileContentHandlers implements ExtHostProfileContentHandlersShape {
    private readonly proxy;
    private readonly handlers;
    constructor(mainContext: IMainContext);
    registerProfileContentHandler(extension: IExtensionDescription, id: string, handler: vscode.ProfileContentHandler): vscode.Disposable;
    $saveProfile(id: string, name: string, content: string, token: CancellationToken): Promise<ISaveProfileResult | null>;
    $readProfile(id: string, idOrUri: string | UriComponents, token: CancellationToken): Promise<string | null>;
}
