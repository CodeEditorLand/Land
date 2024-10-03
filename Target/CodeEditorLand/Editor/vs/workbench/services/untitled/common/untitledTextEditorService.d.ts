import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { UntitledTextEditorModel, IUntitledTextEditorModel } from './untitledTextEditorModel.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare const IUntitledTextEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUntitledTextEditorService>;
export interface INewUntitledTextEditorOptions {
    initialValue?: string;
    languageId?: string;
    encoding?: string;
}
export interface IExistingUntitledTextEditorOptions extends INewUntitledTextEditorOptions {
    untitledResource?: URI;
}
export interface INewUntitledTextEditorWithAssociatedResourceOptions extends INewUntitledTextEditorOptions {
    associatedResource?: {
        authority: string;
        path: string;
        query: string;
        fragment: string;
    };
}
type IInternalUntitledTextEditorOptions = IExistingUntitledTextEditorOptions & INewUntitledTextEditorWithAssociatedResourceOptions;
export interface IUntitledTextEditorModelManager {
    readonly onDidChangeDirty: Event<IUntitledTextEditorModel>;
    readonly onDidChangeEncoding: Event<IUntitledTextEditorModel>;
    readonly onDidChangeLabel: Event<IUntitledTextEditorModel>;
    readonly onDidCreate: Event<IUntitledTextEditorModel>;
    readonly onWillDispose: Event<IUntitledTextEditorModel>;
    create(options?: INewUntitledTextEditorOptions): IUntitledTextEditorModel;
    create(options?: INewUntitledTextEditorWithAssociatedResourceOptions): IUntitledTextEditorModel;
    create(options?: IExistingUntitledTextEditorOptions): IUntitledTextEditorModel;
    get(resource: URI): IUntitledTextEditorModel | undefined;
    getValue(resource: URI): string | undefined;
    resolve(options?: INewUntitledTextEditorOptions): Promise<IUntitledTextEditorModel>;
    resolve(options?: INewUntitledTextEditorWithAssociatedResourceOptions): Promise<IUntitledTextEditorModel>;
    resolve(options?: IExistingUntitledTextEditorOptions): Promise<IUntitledTextEditorModel>;
    isUntitledWithAssociatedResource(resource: URI): boolean;
    canDispose(model: IUntitledTextEditorModel): true | Promise<true>;
}
export interface IUntitledTextEditorService extends IUntitledTextEditorModelManager {
    readonly _serviceBrand: undefined;
}
export declare class UntitledTextEditorService extends Disposable implements IUntitledTextEditorService {
    private readonly instantiationService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    private static readonly UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<IUntitledTextEditorModel>;
    private readonly _onDidChangeEncoding;
    readonly onDidChangeEncoding: Event<IUntitledTextEditorModel>;
    private readonly _onDidCreate;
    readonly onDidCreate: Event<IUntitledTextEditorModel>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<IUntitledTextEditorModel>;
    private readonly _onDidChangeLabel;
    readonly onDidChangeLabel: Event<IUntitledTextEditorModel>;
    private readonly mapResourceToModel;
    constructor(instantiationService: IInstantiationService, configurationService: IConfigurationService);
    get(resource: URI): UntitledTextEditorModel | undefined;
    getValue(resource: URI): string | undefined;
    resolve(options?: IInternalUntitledTextEditorOptions): Promise<UntitledTextEditorModel>;
    create(options?: IInternalUntitledTextEditorOptions): UntitledTextEditorModel;
    private doCreateOrGet;
    private massageOptions;
    private doCreate;
    private registerModel;
    isUntitledWithAssociatedResource(resource: URI): boolean;
    canDispose(model: UntitledTextEditorModel): true | Promise<true>;
    private doCanDispose;
}
export {};
