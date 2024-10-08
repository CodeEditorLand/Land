import './media/welcomeWidget.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
export declare class WelcomeWidget extends Disposable implements IOverlayWidget {
    private readonly _editor;
    private readonly instantiationService;
    private readonly commandService;
    private readonly telemetryService;
    private readonly openerService;
    private readonly _rootDomNode;
    private readonly element;
    private readonly messageContainer;
    private readonly markdownRenderer;
    constructor(_editor: ICodeEditor, instantiationService: IInstantiationService, commandService: ICommandService, telemetryService: ITelemetryService, openerService: IOpenerService);
    executeCommand(commandId: string, ...args: string[]): Promise<void>;
    render(title: string, message: string, buttonText: string, buttonAction: string): Promise<void>;
    private buildWidgetContent;
    private buildStepMarkdownDescription;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    private _isVisible;
    private _show;
    private _hide;
}
