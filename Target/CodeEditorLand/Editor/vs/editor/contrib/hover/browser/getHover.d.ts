import { AsyncIterableObject } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Position } from '../../../common/core/position.js';
import { ITextModel } from '../../../common/model.js';
import { Hover, HoverProvider } from '../../../common/languages.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
export declare class HoverProviderResult {
    readonly provider: HoverProvider;
    readonly hover: Hover;
    readonly ordinal: number;
    constructor(provider: HoverProvider, hover: Hover, ordinal: number);
}
export declare function getHoverProviderResultsAsAsyncIterable(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken, recursive?: boolean): AsyncIterableObject<HoverProviderResult>;
export declare function getHoversPromise(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken, recursive?: boolean): Promise<Hover[]>;
