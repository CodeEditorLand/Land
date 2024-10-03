import { ITextModel } from '../../../common/model.js';
import { CodeLensModel } from './codelens.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare const ICodeLensCache: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICodeLensCache>;
export interface ICodeLensCache {
    readonly _serviceBrand: undefined;
    put(model: ITextModel, data: CodeLensModel): void;
    get(model: ITextModel): CodeLensModel | undefined;
    delete(model: ITextModel): void;
}
export declare class CodeLensCache implements ICodeLensCache {
    readonly _serviceBrand: undefined;
    private readonly _fakeProvider;
    private readonly _cache;
    constructor(storageService: IStorageService);
    put(model: ITextModel, data: CodeLensModel): void;
    get(model: ITextModel): CodeLensModel | undefined;
    delete(model: ITextModel): void;
    private _serialize;
    private _deserialize;
}
