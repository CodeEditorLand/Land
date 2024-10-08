import { URI } from '../../../../base/common/uri.js';
import { Event } from '../../../../base/common/event.js';
import { IDecorationsService, IDecoration, IResourceDecorationChangeEvent, IDecorationsProvider } from '../common/decorations.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
export declare class DecorationsService implements IDecorationsService {
    _serviceBrand: undefined;
    private readonly _store;
    private readonly _onDidChangeDecorationsDelayed;
    private readonly _onDidChangeDecorations;
    onDidChangeDecorations: Event<IResourceDecorationChangeEvent>;
    private readonly _provider;
    private readonly _decorationStyles;
    private readonly _data;
    constructor(uriIdentityService: IUriIdentityService, themeService: IThemeService);
    dispose(): void;
    registerDecorationsProvider(provider: IDecorationsProvider): IDisposable;
    private _ensureEntry;
    getDecoration(uri: URI, includeChildren: boolean): IDecoration | undefined;
    private _fetchData;
    private _keepItem;
}
