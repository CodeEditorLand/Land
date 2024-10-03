import { Event } from '../../../base/common/event.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { IDisposable, IReference } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ITextModel, ITextSnapshot } from '../model.js';
import { IResolvableEditorModel } from '../../../platform/editor/common/editor.js';
export declare const ITextModelService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextModelService>;
export interface ITextModelService {
    readonly _serviceBrand: undefined;
    createModelReference(resource: URI): Promise<IReference<IResolvedTextEditorModel>>;
    registerTextModelContentProvider(scheme: string, provider: ITextModelContentProvider): IDisposable;
    canHandleResource(resource: URI): boolean;
}
export interface ITextModelContentProvider {
    provideTextContent(resource: URI): Promise<ITextModel | null> | null;
}
export interface ITextEditorModel extends IResolvableEditorModel {
    readonly onWillDispose: Event<void>;
    readonly textEditorModel: ITextModel | null;
    createSnapshot(this: IResolvedTextEditorModel): ITextSnapshot;
    createSnapshot(this: ITextEditorModel): ITextSnapshot | null;
    isReadonly(): boolean | IMarkdownString;
    getLanguageId(): string | undefined;
    isDisposed(): boolean;
}
export interface IResolvedTextEditorModel extends ITextEditorModel {
    readonly textEditorModel: ITextModel;
}
export declare function isResolvedTextEditorModel(model: ITextEditorModel): model is IResolvedTextEditorModel;
