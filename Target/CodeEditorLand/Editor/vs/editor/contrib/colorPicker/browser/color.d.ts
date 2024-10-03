import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../common/core/range.js';
import { ITextModel } from '../../../common/model.js';
import { DocumentColorProvider, IColorInformation, IColorPresentation } from '../../../common/languages.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
import { ServicesAccessor } from '../../../browser/editorExtensions.js';
export declare function getColors(colorProviderRegistry: LanguageFeatureRegistry<DocumentColorProvider>, model: ITextModel, token: CancellationToken, isDefaultColorDecoratorsEnabled?: boolean): Promise<IColorData[]>;
export declare function getColorPresentations(model: ITextModel, colorInfo: IColorInformation, provider: DocumentColorProvider, token: CancellationToken): Promise<IColorPresentation[] | null | undefined>;
export interface IColorData {
    colorInfo: IColorInformation;
    provider: DocumentColorProvider;
}
export interface IExtColorData {
    range: IRange;
    color: [number, number, number, number];
}
interface DataCollector<T> {
    compute(provider: DocumentColorProvider, model: ITextModel, token: CancellationToken, result: T[]): Promise<boolean>;
}
export declare class ExtColorDataCollector implements DataCollector<IExtColorData> {
    constructor();
    compute(provider: DocumentColorProvider, model: ITextModel, token: CancellationToken, colors: IExtColorData[]): Promise<boolean>;
}
export declare class ColorPresentationsCollector implements DataCollector<IColorPresentation> {
    private colorInfo;
    constructor(colorInfo: IColorInformation);
    compute(provider: DocumentColorProvider, model: ITextModel, _token: CancellationToken, colors: IColorPresentation[]): Promise<boolean>;
}
export declare function _findColorData<T extends IColorPresentation | IExtColorData | IColorData>(collector: DataCollector<T>, colorProviderRegistry: LanguageFeatureRegistry<DocumentColorProvider>, model: ITextModel, token: CancellationToken, isDefaultColorDecoratorsEnabled: boolean): Promise<T[]>;
export declare function _setupColorCommand(accessor: ServicesAccessor, resource: URI): {
    model: ITextModel;
    colorProviderRegistry: LanguageFeatureRegistry<DocumentColorProvider>;
    isDefaultColorDecoratorsEnabled: boolean;
};
export {};
