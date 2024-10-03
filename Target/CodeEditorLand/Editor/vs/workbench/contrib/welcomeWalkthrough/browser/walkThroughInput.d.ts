import { Dimension } from '../../../../base/browser/dom.js';
import { DisposableStore, IReference } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ITextEditorModel, ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { EditorInputCapabilities, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
declare class WalkThroughModel extends EditorModel {
    private mainRef;
    private snippetRefs;
    constructor(mainRef: string, snippetRefs: IReference<ITextEditorModel>[]);
    get main(): string;
    get snippets(): ITextEditorModel[];
    dispose(): void;
}
export interface WalkThroughInputOptions {
    readonly typeId: string;
    readonly name: string;
    readonly description?: string;
    readonly resource: URI;
    readonly telemetryFrom: string;
    readonly onReady?: (container: HTMLElement, contentDisposables: DisposableStore) => void;
    readonly layout?: (dimension: Dimension) => void;
}
export declare class WalkThroughInput extends EditorInput {
    private readonly options;
    private readonly instantiationService;
    private readonly textModelResolverService;
    get capabilities(): EditorInputCapabilities;
    private promise;
    private maxTopScroll;
    private maxBottomScroll;
    get resource(): URI;
    constructor(options: WalkThroughInputOptions, instantiationService: IInstantiationService, textModelResolverService: ITextModelService);
    get typeId(): string;
    getName(): string;
    getDescription(): string;
    getTelemetryFrom(): string;
    getTelemetryDescriptor(): {
        [key: string]: unknown;
    };
    get onReady(): ((container: HTMLElement, contentDisposables: DisposableStore) => void) | undefined;
    get layout(): ((dimension: Dimension) => void) | undefined;
    resolve(): Promise<WalkThroughModel>;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
    relativeScrollPosition(topScroll: number, bottomScroll: number): void;
}
export {};
