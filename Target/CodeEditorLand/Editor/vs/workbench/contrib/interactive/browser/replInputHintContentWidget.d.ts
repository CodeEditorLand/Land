import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export declare class ReplInputHintContentWidget extends Disposable implements IContentWidget {
    private readonly editor;
    private readonly configurationService;
    private readonly keybindingService;
    private static readonly ID;
    private domNode;
    private ariaLabel;
    constructor(editor: ICodeEditor, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    getId(): string;
    getPosition(): IContentWidgetPosition | null;
    getDomNode(): HTMLElement;
    private setHint;
    private getKeybinding;
    dispose(): void;
}
