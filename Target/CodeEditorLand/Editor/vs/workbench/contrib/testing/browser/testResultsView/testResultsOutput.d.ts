import * as dom from '../../../../../base/browser/dom.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { IDiffEditorOptions } from '../../../../../editor/common/config/editorOptions.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IViewDescriptorService } from '../../../../common/views.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { InspectSubject } from './testResultsSubject.js';
export interface IPeekOutputRenderer extends IDisposable {
    onDidContentSizeChange?: Event<void>;
    update(subject: InspectSubject): Promise<boolean>;
    layout(dimension: dom.IDimension, hasMultipleFrames: boolean): number | undefined;
    dispose(): void;
}
export declare class DiffContentProvider extends Disposable implements IPeekOutputRenderer {
    private readonly editor;
    private readonly container;
    private readonly instantiationService;
    private readonly modelService;
    private readonly widget;
    private readonly model;
    private dimension?;
    get onDidContentSizeChange(): Event<any>;
    constructor(editor: ICodeEditor | undefined, container: HTMLElement, instantiationService: IInstantiationService, modelService: ITextModelService);
    update(subject: InspectSubject): Promise<boolean>;
    private clear;
    layout(dimensions: dom.IDimension, hasMultipleFrames: boolean): number | undefined;
    protected getOptions(isMultiline: boolean): IDiffEditorOptions;
}
export declare class MarkdownTestMessagePeek extends Disposable implements IPeekOutputRenderer {
    private readonly container;
    private readonly instantiationService;
    private readonly markdown;
    private element?;
    constructor(container: HTMLElement, instantiationService: IInstantiationService);
    update(subject: InspectSubject): Promise<boolean>;
    layout(dimension: dom.IDimension): number | undefined;
    private clear;
}
export declare class PlainTextMessagePeek extends Disposable implements IPeekOutputRenderer {
    private readonly editor;
    private readonly container;
    private readonly instantiationService;
    private readonly modelService;
    private readonly widgetDecorations;
    private readonly widget;
    private readonly model;
    private dimension?;
    get onDidContentSizeChange(): Event<any>;
    constructor(editor: ICodeEditor | undefined, container: HTMLElement, instantiationService: IInstantiationService, modelService: ITextModelService);
    update(subject: InspectSubject): Promise<boolean>;
    private clear;
    layout(dimensions: dom.IDimension, hasMultipleFrames: boolean): number | undefined;
}
export declare class TerminalMessagePeek extends Disposable implements IPeekOutputRenderer {
    private readonly container;
    private readonly isInPeekView;
    private readonly terminalService;
    private readonly viewDescriptorService;
    private readonly workspaceContext;
    private dimensions?;
    private readonly terminalCwd;
    private readonly xtermLayoutDelayer;
    private readonly terminal;
    private readonly outputDataListener;
    constructor(container: HTMLElement, isInPeekView: boolean, terminalService: ITerminalService, viewDescriptorService: IViewDescriptorService, workspaceContext: IWorkspaceContextService);
    private makeTerminal;
    update(subject: InspectSubject): Promise<boolean>;
    private updateForTestSubject;
    private updateForTaskSubject;
    private updateGenerically;
    private updateCwd;
    private writeNotice;
    private attachTerminalToDom;
    private clear;
    layout(dimensions: dom.IDimension): number | undefined;
    private layoutTerminal;
}
