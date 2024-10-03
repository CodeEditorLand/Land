import { Event } from '../../../../../base/common/event.js';
import { IQuickInputService, IQuickPickItem } from '../../../../../platform/quickinput/common/quickInput.js';
import { IDetectedLinks } from './terminalLinkManager.js';
import { type IDetachedTerminalInstance, type ITerminalInstance } from '../../../terminal/browser/terminal.js';
import type { ILink } from '@xterm/xterm';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import type { TerminalLink } from './terminalLink.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IAccessibleViewService } from '../../../../../platform/accessibility/browser/accessibleView.js';
export declare class TerminalLinkQuickpick extends DisposableStore {
    private readonly _labelService;
    private readonly _quickInputService;
    private readonly _accessibleViewService;
    private readonly _editorSequencer;
    private readonly _editorViewState;
    private _instance;
    private readonly _onDidRequestMoreLinks;
    readonly onDidRequestMoreLinks: Event<void>;
    constructor(_labelService: ILabelService, _quickInputService: IQuickInputService, _accessibleViewService: IAccessibleViewService, instantiationService: IInstantiationService);
    show(instance: ITerminalInstance | IDetachedTerminalInstance, links: {
        viewport: IDetectedLinks;
        all: Promise<IDetectedLinks>;
    }): Promise<void>;
    private _generatePicks;
    private _previewItem;
    private _previewItemInEditor;
    private _terminalScrollStateSaved;
    private _previewItemInTerminal;
}
export interface ITerminalLinkQuickPickItem extends IQuickPickItem {
    link: ILink | TerminalLink;
}
