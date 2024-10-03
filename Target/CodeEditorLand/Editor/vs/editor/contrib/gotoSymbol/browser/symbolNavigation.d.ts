import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { OneReference } from './referencesModel.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const ctxHasSymbols: RawContextKey<false>;
export declare const ISymbolNavigationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISymbolNavigationService>;
export interface ISymbolNavigationService {
    readonly _serviceBrand: undefined;
    reset(): void;
    put(anchor: OneReference): void;
    revealNext(source: ICodeEditor): Promise<any>;
}
