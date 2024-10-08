import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import './standalone-tokens.css';
import { ICodeEditor } from '../../browser/editorBrowser.js';
import { IWebWorkerOptions, MonacoWebWorker } from './standaloneWebWorker.js';
import { IPosition } from '../../common/core/position.js';
import { IRange } from '../../common/core/range.js';
import { IDiffEditor } from '../../common/editorCommon.js';
import * as languages from '../../common/languages.js';
import { ITextModel } from '../../common/model.js';
import { IColorizerElementOptions, IColorizerOptions } from './colorizer.js';
import { IActionDescriptor, IStandaloneCodeEditor, IStandaloneDiffEditor, IStandaloneDiffEditorConstructionOptions, IStandaloneEditorConstructionOptions } from './standaloneCodeEditor.js';
import { IEditorOverrideServices } from './standaloneServices.js';
import { IStandaloneThemeData } from '../common/standaloneTheme.js';
import { ICommandHandler } from '../../../platform/commands/common/commands.js';
import { IMarker, IMarkerData } from '../../../platform/markers/common/markers.js';
import { MultiDiffEditorWidget } from '../../browser/widget/multiDiffEditor/multiDiffEditorWidget.js';
/**
 * Create a new editor under `domElement`.
 * `domElement` should be empty (not contain other dom nodes).
 * The editor will read the size of `domElement`.
 */
export declare function create(domElement: HTMLElement, options?: IStandaloneEditorConstructionOptions, override?: IEditorOverrideServices): IStandaloneCodeEditor;
/**
 * Emitted when an editor is created.
 * Creating a diff editor might cause this listener to be invoked with the two editors.
 * @event
 */
export declare function onDidCreateEditor(listener: (codeEditor: ICodeEditor) => void): IDisposable;
/**
 * Emitted when an diff editor is created.
 * @event
 */
export declare function onDidCreateDiffEditor(listener: (diffEditor: IDiffEditor) => void): IDisposable;
/**
 * Get all the created editors.
 */
export declare function getEditors(): readonly ICodeEditor[];
/**
 * Get all the created diff editors.
 */
export declare function getDiffEditors(): readonly IDiffEditor[];
/**
 * Create a new diff editor under `domElement`.
 * `domElement` should be empty (not contain other dom nodes).
 * The editor will read the size of `domElement`.
 */
export declare function createDiffEditor(domElement: HTMLElement, options?: IStandaloneDiffEditorConstructionOptions, override?: IEditorOverrideServices): IStandaloneDiffEditor;
export declare function createMultiFileDiffEditor(domElement: HTMLElement, override?: IEditorOverrideServices): MultiDiffEditorWidget;
/**
 * Description of a command contribution
 */
export interface ICommandDescriptor {
    /**
     * An unique identifier of the contributed command.
     */
    id: string;
    /**
     * Callback that will be executed when the command is triggered.
     */
    run: ICommandHandler;
}
/**
 * Add a command.
 */
export declare function addCommand(descriptor: ICommandDescriptor): IDisposable;
/**
 * Add an action to all editors.
 */
export declare function addEditorAction(descriptor: IActionDescriptor): IDisposable;
/**
 * A keybinding rule.
 */
export interface IKeybindingRule {
    keybinding: number;
    command?: string | null;
    commandArgs?: any;
    when?: string | null;
}
/**
 * Add a keybinding rule.
 */
export declare function addKeybindingRule(rule: IKeybindingRule): IDisposable;
/**
 * Add keybinding rules.
 */
export declare function addKeybindingRules(rules: IKeybindingRule[]): IDisposable;
/**
 * Create a new editor model.
 * You can specify the language that should be set for this model or let the language be inferred from the `uri`.
 */
export declare function createModel(value: string, language?: string, uri?: URI): ITextModel;
/**
 * Change the language for a model.
 */
export declare function setModelLanguage(model: ITextModel, mimeTypeOrLanguageId: string): void;
/**
 * Set the markers for a model.
 */
export declare function setModelMarkers(model: ITextModel, owner: string, markers: IMarkerData[]): void;
/**
 * Remove all markers of an owner.
 */
export declare function removeAllMarkers(owner: string): void;
/**
 * Get markers for owner and/or resource
 *
 * @returns list of markers
 */
export declare function getModelMarkers(filter: {
    owner?: string;
    resource?: URI;
    take?: number;
}): IMarker[];
/**
 * Emitted when markers change for a model.
 * @event
 */
export declare function onDidChangeMarkers(listener: (e: readonly URI[]) => void): IDisposable;
/**
 * Get the model that has `uri` if it exists.
 */
export declare function getModel(uri: URI): ITextModel | null;
/**
 * Get all the created models.
 */
export declare function getModels(): ITextModel[];
/**
 * Emitted when a model is created.
 * @event
 */
export declare function onDidCreateModel(listener: (model: ITextModel) => void): IDisposable;
/**
 * Emitted right before a model is disposed.
 * @event
 */
export declare function onWillDisposeModel(listener: (model: ITextModel) => void): IDisposable;
/**
 * Emitted when a different language is set to a model.
 * @event
 */
export declare function onDidChangeModelLanguage(listener: (e: {
    readonly model: ITextModel;
    readonly oldLanguage: string;
}) => void): IDisposable;
/**
 * Create a new web worker that has model syncing capabilities built in.
 * Specify an AMD module to load that will `create` an object that will be proxied.
 */
export declare function createWebWorker<T extends object>(opts: IWebWorkerOptions): MonacoWebWorker<T>;
/**
 * Colorize the contents of `domNode` using attribute `data-lang`.
 */
export declare function colorizeElement(domNode: HTMLElement, options: IColorizerElementOptions): Promise<void>;
/**
 * Colorize `text` using language `languageId`.
 */
export declare function colorize(text: string, languageId: string, options: IColorizerOptions): Promise<string>;
/**
 * Colorize a line in a model.
 */
export declare function colorizeModelLine(model: ITextModel, lineNumber: number, tabSize?: number): string;
/**
 * Tokenize `text` using language `languageId`
 */
export declare function tokenize(text: string, languageId: string): languages.Token[][];
/**
 * Define a new theme or update an existing theme.
 */
export declare function defineTheme(themeName: string, themeData: IStandaloneThemeData): void;
/**
 * Switches to a theme.
 */
export declare function setTheme(themeName: string): void;
/**
 * Clears all cached font measurements and triggers re-measurement.
 */
export declare function remeasureFonts(): void;
/**
 * Register a command.
 */
export declare function registerCommand(id: string, handler: (accessor: any, ...args: any[]) => void): IDisposable;
export interface ILinkOpener {
    open(resource: URI): boolean | Promise<boolean>;
}
/**
 * Registers a handler that is called when a link is opened in any editor. The handler callback should return `true` if the link was handled and `false` otherwise.
 * The handler that was registered last will be called first when a link is opened.
 *
 * Returns a disposable that can unregister the opener again.
 */
export declare function registerLinkOpener(opener: ILinkOpener): IDisposable;
/**
 * Represents an object that can handle editor open operations (e.g. when "go to definition" is called
 * with a resource other than the current model).
 */
export interface ICodeEditorOpener {
    /**
     * Callback that is invoked when a resource other than the current model should be opened (e.g. when "go to definition" is called).
     * The callback should return `true` if the request was handled and `false` otherwise.
     * @param source The code editor instance that initiated the request.
     * @param resource The URI of the resource that should be opened.
     * @param selectionOrPosition An optional position or selection inside the model corresponding to `resource` that can be used to set the cursor.
     */
    openCodeEditor(source: ICodeEditor, resource: URI, selectionOrPosition?: IRange | IPosition): boolean | Promise<boolean>;
}
/**
 * Registers a handler that is called when a resource other than the current model should be opened in the editor (e.g. "go to definition").
 * The handler callback should return `true` if the request was handled and `false` otherwise.
 *
 * Returns a disposable that can unregister the opener again.
 *
 * If no handler is registered the default behavior is to do nothing for models other than the currently attached one.
 */
export declare function registerEditorOpener(opener: ICodeEditorOpener): IDisposable;
/**
 * @internal
 */
export declare function createMonacoEditorAPI(): typeof monaco.editor;
