import { URI } from '../../base/common/uri.js';
import { IIconLabelValueOptions, IIconLabelCreationOptions } from '../../base/browser/ui/iconLabel/iconLabel.js';
import { ILanguageService } from '../../editor/common/languages/language.js';
import { IWorkspaceContextService } from '../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { IModelService } from '../../editor/common/services/model.js';
import { ITextFileService } from '../services/textfile/common/textfiles.js';
import { IDecorationsService } from '../services/decorations/common/decorations.js';
import { FileKind } from '../../platform/files/common/files.js';
import { IThemeService } from '../../platform/theme/common/themeService.js';
import { Event } from '../../base/common/event.js';
import { ILabelService } from '../../platform/label/common/label.js';
import { Disposable, IDisposable } from '../../base/common/lifecycle.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { IRange } from '../../editor/common/core/range.js';
import { ThemeIcon } from '../../base/common/themables.js';
export interface IResourceLabelProps {
    resource?: URI | {
        primary?: URI;
        secondary?: URI;
    };
    name?: string | string[];
    range?: IRange;
    description?: string;
}
export interface IResourceLabelOptions extends IIconLabelValueOptions {
    /**
     * A hint to the file kind of the resource.
     */
    fileKind?: FileKind;
    /**
     * File decorations to use for the label.
     */
    readonly fileDecorations?: {
        colors: boolean;
        badges: boolean;
    };
    /**
     * Will take the provided label as is and e.g. not override it for untitled files.
     */
    readonly forceLabel?: boolean;
    /**
     * Uses the provided icon instead of deriving a resource icon.
     */
    readonly icon?: ThemeIcon | URI;
}
export interface IFileLabelOptions extends IResourceLabelOptions {
    hideLabel?: boolean;
    hidePath?: boolean;
    range?: IRange;
}
export interface IResourceLabel extends IDisposable {
    readonly element: HTMLElement;
    readonly onDidRender: Event<void>;
    /**
     * Most generic way to apply a label with raw information.
     */
    setLabel(label?: string, description?: string, options?: IIconLabelValueOptions): void;
    /**
     * Convenient method to apply a label by passing a resource along.
     *
     * Note: for file resources consider to use the #setFile() method instead.
     */
    setResource(label: IResourceLabelProps, options?: IResourceLabelOptions): void;
    /**
     * Convenient method to render a file label based on a resource.
     */
    setFile(resource: URI, options?: IFileLabelOptions): void;
    /**
     * Resets the label to be empty.
     */
    clear(): void;
}
export interface IResourceLabelsContainer {
    readonly onDidChangeVisibility: Event<boolean>;
}
export declare const DEFAULT_LABELS_CONTAINER: IResourceLabelsContainer;
export declare class ResourceLabels extends Disposable {
    private readonly instantiationService;
    private readonly configurationService;
    private readonly modelService;
    private readonly workspaceService;
    private readonly languageService;
    private readonly decorationsService;
    private readonly themeService;
    private readonly labelService;
    private readonly textFileService;
    private readonly _onDidChangeDecorations;
    readonly onDidChangeDecorations: Event<void>;
    private widgets;
    private labels;
    constructor(container: IResourceLabelsContainer, instantiationService: IInstantiationService, configurationService: IConfigurationService, modelService: IModelService, workspaceService: IWorkspaceContextService, languageService: ILanguageService, decorationsService: IDecorationsService, themeService: IThemeService, labelService: ILabelService, textFileService: ITextFileService);
    private registerListeners;
    get(index: number): IResourceLabel;
    create(container: HTMLElement, options?: IIconLabelCreationOptions): IResourceLabel;
    private disposeWidget;
    clear(): void;
    dispose(): void;
}
/**
 * Note: please consider to use `ResourceLabels` if you are in need
 * of more than one label for your widget.
 */
export declare class ResourceLabel extends ResourceLabels {
    private label;
    get element(): IResourceLabel;
    constructor(container: HTMLElement, options: IIconLabelCreationOptions | undefined, instantiationService: IInstantiationService, configurationService: IConfigurationService, modelService: IModelService, workspaceService: IWorkspaceContextService, languageService: ILanguageService, decorationsService: IDecorationsService, themeService: IThemeService, labelService: ILabelService, textFileService: ITextFileService);
}
