import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import * as languages from '../../../../editor/common/languages.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IExternalOpener, IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
export declare const IExternalUriOpenerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExternalUriOpenerService>;
export interface IExternalOpenerProvider {
    getOpeners(targetUri: URI): AsyncIterable<IExternalUriOpener>;
}
export interface IExternalUriOpener {
    readonly id: string;
    readonly label: string;
    canOpen(uri: URI, token: CancellationToken): Promise<languages.ExternalUriOpenerPriority>;
    openExternalUri(uri: URI, ctx: {
        sourceUri: URI;
    }, token: CancellationToken): Promise<boolean>;
}
export interface IExternalUriOpenerService {
    readonly _serviceBrand: undefined;
    /**
     * Registers a provider for external resources openers.
     */
    registerExternalOpenerProvider(provider: IExternalOpenerProvider): IDisposable;
    /**
     * Get the configured IExternalUriOpener for the the uri.
     * If there is no opener configured, then returns the first opener that can handle the uri.
     */
    getOpener(uri: URI, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<IExternalUriOpener | undefined>;
}
export declare class ExternalUriOpenerService extends Disposable implements IExternalUriOpenerService, IExternalOpener {
    private readonly configurationService;
    private readonly logService;
    private readonly preferencesService;
    private readonly quickInputService;
    readonly _serviceBrand: undefined;
    private readonly _providers;
    constructor(openerService: IOpenerService, configurationService: IConfigurationService, logService: ILogService, preferencesService: IPreferencesService, quickInputService: IQuickInputService);
    registerExternalOpenerProvider(provider: IExternalOpenerProvider): IDisposable;
    private getOpeners;
    openExternal(href: string, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<boolean>;
    getOpener(targetUri: URI, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<IExternalUriOpener | undefined>;
    private getAllOpenersForUri;
    private getConfiguredOpenerForUri;
    private showOpenerPrompt;
}
