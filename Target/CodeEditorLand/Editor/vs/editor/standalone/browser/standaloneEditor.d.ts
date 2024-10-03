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
export declare function create(domElement: HTMLElement, options?: IStandaloneEditorConstructionOptions, override?: IEditorOverrideServices): IStandaloneCodeEditor;
export declare function onDidCreateEditor(listener: (codeEditor: ICodeEditor) => void): IDisposable;
export declare function onDidCreateDiffEditor(listener: (diffEditor: IDiffEditor) => void): IDisposable;
export declare function getEditors(): readonly ICodeEditor[];
export declare function getDiffEditors(): readonly IDiffEditor[];
export declare function createDiffEditor(domElement: HTMLElement, options?: IStandaloneDiffEditorConstructionOptions, override?: IEditorOverrideServices): IStandaloneDiffEditor;
export declare function createMultiFileDiffEditor(domElement: HTMLElement, override?: IEditorOverrideServices): MultiDiffEditorWidget;
export interface ICommandDescriptor {
    id: string;
    run: ICommandHandler;
}
export declare function addCommand(descriptor: ICommandDescriptor): IDisposable;
export declare function addEditorAction(descriptor: IActionDescriptor): IDisposable;
export interface IKeybindingRule {
    keybinding: number;
    command?: string | null;
    commandArgs?: any;
    when?: string | null;
}
export declare function addKeybindingRule(rule: IKeybindingRule): IDisposable;
export declare function addKeybindingRules(rules: IKeybindingRule[]): IDisposable;
export declare function createModel(value: string, language?: string, uri?: URI): ITextModel;
export declare function setModelLanguage(model: ITextModel, mimeTypeOrLanguageId: string): void;
export declare function setModelMarkers(model: ITextModel, owner: string, markers: IMarkerData[]): void;
export declare function removeAllMarkers(owner: string): void;
export declare function getModelMarkers(filter: {
    owner?: string;
    resource?: URI;
    take?: number;
}): IMarker[];
export declare function onDidChangeMarkers(listener: (e: readonly URI[]) => void): IDisposable;
export declare function getModel(uri: URI): ITextModel | null;
export declare function getModels(): ITextModel[];
export declare function onDidCreateModel(listener: (model: ITextModel) => void): IDisposable;
export declare function onWillDisposeModel(listener: (model: ITextModel) => void): IDisposable;
export declare function onDidChangeModelLanguage(listener: (e: {
    readonly model: ITextModel;
    readonly oldLanguage: string;
}) => void): IDisposable;
export declare function createWebWorker<T extends object>(opts: IWebWorkerOptions): MonacoWebWorker<T>;
export declare function colorizeElement(domNode: HTMLElement, options: IColorizerElementOptions): Promise<void>;
export declare function colorize(text: string, languageId: string, options: IColorizerOptions): Promise<string>;
export declare function colorizeModelLine(model: ITextModel, lineNumber: number, tabSize?: number): string;
export declare function tokenize(text: string, languageId: string): languages.Token[][];
export declare function defineTheme(themeName: string, themeData: IStandaloneThemeData): void;
export declare function setTheme(themeName: string): void;
export declare function remeasureFonts(): void;
export declare function registerCommand(id: string, handler: (accessor: any, ...args: any[]) => void): IDisposable;
export interface ILinkOpener {
    open(resource: URI): boolean | Promise<boolean>;
}
export declare function registerLinkOpener(opener: ILinkOpener): IDisposable;
export interface ICodeEditorOpener {
    openCodeEditor(source: ICodeEditor, resource: URI, selectionOrPosition?: IRange | IPosition): boolean | Promise<boolean>;
}
export declare function registerEditorOpener(opener: ICodeEditorOpener): IDisposable;
export declare function createMonacoEditorAPI(): typeof monaco.editor;
