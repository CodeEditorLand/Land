import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IChatRequestVariableEntry } from '../../common/chatModel.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IChatContentReference } from '../../common/chatService.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
export declare class ChatAttachmentsContentPart extends Disposable {
    private readonly variables;
    private readonly contentReferences;
    readonly domNode: HTMLElement;
    private readonly instantiationService;
    private readonly openerService;
    private readonly hoverService;
    private readonly fileService;
    private readonly attachedContextDisposables;
    private readonly _onDidChangeVisibility;
    private readonly _contextResourceLabels;
    constructor(variables: IChatRequestVariableEntry[], contentReferences: ReadonlyArray<IChatContentReference> | undefined, domNode: HTMLElement | undefined, instantiationService: IInstantiationService, openerService: IOpenerService, hoverService: IHoverService, fileService: IFileService);
    private initAttachedContext;
    private createImageElements;
}
