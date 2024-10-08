import * as dom from '../../../base/browser/dom.js';
import { Event } from '../../../base/common/event.js';
import { ICodeEditorService } from '../../browser/services/codeEditorService.js';
import { ILayoutOffsetInfo, ILayoutService } from '../../../platform/layout/browser/layoutService.js';
declare class StandaloneLayoutService implements ILayoutService {
    private _codeEditorService;
    readonly _serviceBrand: undefined;
    readonly onDidLayoutMainContainer: Event<any>;
    readonly onDidLayoutActiveContainer: Event<any>;
    readonly onDidLayoutContainer: Event<any>;
    readonly onDidChangeActiveContainer: Event<any>;
    readonly onDidAddContainer: Event<any>;
    get mainContainer(): HTMLElement;
    get activeContainer(): HTMLElement;
    get mainContainerDimension(): dom.IDimension;
    get activeContainerDimension(): dom.Dimension;
    readonly mainContainerOffset: ILayoutOffsetInfo;
    readonly activeContainerOffset: ILayoutOffsetInfo;
    get containers(): Iterable<HTMLElement>;
    getContainer(): HTMLElement;
    whenContainerStylesLoaded(): undefined;
    focus(): void;
    constructor(_codeEditorService: ICodeEditorService);
}
export declare class EditorScopedLayoutService extends StandaloneLayoutService {
    private _container;
    get mainContainer(): HTMLElement;
    constructor(_container: HTMLElement, codeEditorService: ICodeEditorService);
}
export {};
