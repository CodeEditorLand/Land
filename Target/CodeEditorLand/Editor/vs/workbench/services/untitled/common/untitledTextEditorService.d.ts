import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { UntitledTextEditorModel, IUntitledTextEditorModel } from './untitledTextEditorModel.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare const IUntitledTextEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUntitledTextEditorService>;
export interface INewUntitledTextEditorOptions {
    /**
     * Initial value of the untitled editor. An untitled editor with initial
     * value is dirty right from the beginning.
     */
    initialValue?: string;
    /**
     * Preferred language id to use when saving the untitled editor.
     */
    languageId?: string;
    /**
     * Preferred encoding to use when saving the untitled editor.
     */
    encoding?: string;
}
export interface IExistingUntitledTextEditorOptions extends INewUntitledTextEditorOptions {
    /**
     * A resource to identify the untitled editor to create or return
     * if already existing.
     *
     * Note: the resource will not be used unless the scheme is `untitled`.
     */
    untitledResource?: URI;
}
export interface INewUntitledTextEditorWithAssociatedResourceOptions extends INewUntitledTextEditorOptions {
    /**
     * Resource components to associate with the untitled editor. When saving
     * the untitled editor, the associated components will be used and the user
     * is not being asked to provide a file path.
     *
     * Note: currently it is not possible to specify the `scheme` to use. The
     * untitled editor will saved to the default local or remote resource.
     */
    associatedResource?: {
        authority: string;
        path: string;
        query: string;
        fragment: string;
    };
}
type IInternalUntitledTextEditorOptions = IExistingUntitledTextEditorOptions & INewUntitledTextEditorWithAssociatedResourceOptions;
export interface IUntitledTextEditorModelManager {
    /**
     * Events for when untitled text editors change (e.g. getting dirty, saved or reverted).
     */
    readonly onDidChangeDirty: Event<IUntitledTextEditorModel>;
    /**
     * Events for when untitled text editor encodings change.
     */
    readonly onDidChangeEncoding: Event<IUntitledTextEditorModel>;
    /**
     * Events for when untitled text editor labels change.
     */
    readonly onDidChangeLabel: Event<IUntitledTextEditorModel>;
    /**
     * Events for when untitled text editor models are created.
     */
    readonly onDidCreate: Event<IUntitledTextEditorModel>;
    /**
     * Events for when untitled text editors are about to be disposed.
     */
    readonly onWillDispose: Event<IUntitledTextEditorModel>;
    /**
     * Creates a new untitled editor model with the provided options. If the `untitledResource`
     * property is provided and the untitled editor exists, it will return that existing
     * instance instead of creating a new one.
     */
    create(options?: INewUntitledTextEditorOptions): IUntitledTextEditorModel;
    create(options?: INewUntitledTextEditorWithAssociatedResourceOptions): IUntitledTextEditorModel;
    create(options?: IExistingUntitledTextEditorOptions): IUntitledTextEditorModel;
    /**
     * Returns an existing untitled editor model if already created before.
     */
    get(resource: URI): IUntitledTextEditorModel | undefined;
    /**
     * Returns the value of the untitled editor, undefined if none exists
     * @param resource The URI of the untitled file
     * @returns The content, or undefined
     */
    getValue(resource: URI): string | undefined;
    /**
     * Resolves an untitled editor model from the provided options. If the `untitledResource`
     * property is provided and the untitled editor exists, it will return that existing
     * instance instead of creating a new one.
     */
    resolve(options?: INewUntitledTextEditorOptions): Promise<IUntitledTextEditorModel>;
    resolve(options?: INewUntitledTextEditorWithAssociatedResourceOptions): Promise<IUntitledTextEditorModel>;
    resolve(options?: IExistingUntitledTextEditorOptions): Promise<IUntitledTextEditorModel>;
    /**
     * Figures out if the given resource has an associated resource or not.
     */
    isUntitledWithAssociatedResource(resource: URI): boolean;
    /**
     * Waits for the model to be ready to be disposed. There may be conditions
     * under which the model cannot be disposed, e.g. when it is dirty. Once the
     * promise is settled, it is safe to dispose the model.
     */
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
