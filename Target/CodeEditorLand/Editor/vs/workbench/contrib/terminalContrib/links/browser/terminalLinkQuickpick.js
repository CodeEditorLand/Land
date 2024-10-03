var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { EventType } from '../../../../../base/browser/dom.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { localize } from '../../../../../nls.js';
import { IQuickInputService, QuickInputHideReason } from '../../../../../platform/quickinput/common/quickInput.js';
import { TerminalLinkQuickPickEvent } from '../../../terminal/browser/terminal.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { Sequencer, timeout } from '../../../../../base/common/async.js';
import { PickerEditorState } from '../../../../browser/quickaccess.js';
import { getLinkSuffix } from './terminalLinkParsing.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { basenameOrAuthority, dirname } from '../../../../../base/common/resources.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IAccessibleViewService } from '../../../../../platform/accessibility/browser/accessibleView.js';
let TerminalLinkQuickpick = class TerminalLinkQuickpick extends DisposableStore {
    constructor(_labelService, _quickInputService, _accessibleViewService, instantiationService) {
        super();
        this._labelService = _labelService;
        this._quickInputService = _quickInputService;
        this._accessibleViewService = _accessibleViewService;
        this._editorSequencer = new Sequencer();
        this._onDidRequestMoreLinks = this.add(new Emitter());
        this.onDidRequestMoreLinks = this._onDidRequestMoreLinks.event;
        this._terminalScrollStateSaved = false;
        this._editorViewState = this.add(instantiationService.createInstance(PickerEditorState));
    }
    async show(instance, links) {
        this._instance = instance;
        const result = await Promise.race([links.all, timeout(500)]);
        const usingAllLinks = typeof result === 'object';
        const resolvedLinks = usingAllLinks ? result : links.viewport;
        const wordPicks = resolvedLinks.wordLinks ? await this._generatePicks(resolvedLinks.wordLinks) : undefined;
        const filePicks = resolvedLinks.fileLinks ? await this._generatePicks(resolvedLinks.fileLinks) : undefined;
        const folderPicks = resolvedLinks.folderLinks ? await this._generatePicks(resolvedLinks.folderLinks) : undefined;
        const webPicks = resolvedLinks.webLinks ? await this._generatePicks(resolvedLinks.webLinks) : undefined;
        const picks = [];
        if (webPicks) {
            picks.push({ type: 'separator', label: localize('terminal.integrated.urlLinks', "Url") });
            picks.push(...webPicks);
        }
        if (filePicks) {
            picks.push({ type: 'separator', label: localize('terminal.integrated.localFileLinks', "File") });
            picks.push(...filePicks);
        }
        if (folderPicks) {
            picks.push({ type: 'separator', label: localize('terminal.integrated.localFolderLinks', "Folder") });
            picks.push(...folderPicks);
        }
        if (wordPicks) {
            picks.push({ type: 'separator', label: localize('terminal.integrated.searchLinks', "Workspace Search") });
            picks.push(...wordPicks);
        }
        const pick = this._quickInputService.createQuickPick({ useSeparators: true });
        const disposables = new DisposableStore();
        disposables.add(pick);
        pick.items = picks;
        pick.placeholder = localize('terminal.integrated.openDetectedLink', "Select the link to open, type to filter all links");
        pick.sortByLabel = false;
        pick.show();
        if (pick.activeItems.length > 0) {
            this._previewItem(pick.activeItems[0]);
        }
        let accepted = false;
        if (!usingAllLinks) {
            disposables.add(Event.once(pick.onDidChangeValue)(async () => {
                const allLinks = await links.all;
                if (accepted) {
                    return;
                }
                const wordIgnoreLinks = [...(allLinks.fileLinks ?? []), ...(allLinks.folderLinks ?? []), ...(allLinks.webLinks ?? [])];
                const wordPicks = allLinks.wordLinks ? await this._generatePicks(allLinks.wordLinks, wordIgnoreLinks) : undefined;
                const filePicks = allLinks.fileLinks ? await this._generatePicks(allLinks.fileLinks) : undefined;
                const folderPicks = allLinks.folderLinks ? await this._generatePicks(allLinks.folderLinks) : undefined;
                const webPicks = allLinks.webLinks ? await this._generatePicks(allLinks.webLinks) : undefined;
                const picks = [];
                if (webPicks) {
                    picks.push({ type: 'separator', label: localize('terminal.integrated.urlLinks', "Url") });
                    picks.push(...webPicks);
                }
                if (filePicks) {
                    picks.push({ type: 'separator', label: localize('terminal.integrated.localFileLinks', "File") });
                    picks.push(...filePicks);
                }
                if (folderPicks) {
                    picks.push({ type: 'separator', label: localize('terminal.integrated.localFolderLinks', "Folder") });
                    picks.push(...folderPicks);
                }
                if (wordPicks) {
                    picks.push({ type: 'separator', label: localize('terminal.integrated.searchLinks', "Workspace Search") });
                    picks.push(...wordPicks);
                }
                pick.items = picks;
            }));
        }
        disposables.add(pick.onDidChangeActive(async () => {
            const [item] = pick.activeItems;
            this._previewItem(item);
        }));
        return new Promise(r => {
            disposables.add(pick.onDidHide(({ reason }) => {
                if (this._terminalScrollStateSaved) {
                    const markTracker = this._instance?.xterm?.markTracker;
                    if (markTracker) {
                        markTracker.restoreScrollState();
                        markTracker.clear();
                        this._terminalScrollStateSaved = false;
                    }
                }
                if (reason === QuickInputHideReason.Gesture) {
                    this._editorViewState.restore();
                }
                disposables.dispose();
                if (pick.selectedItems.length === 0) {
                    this._accessibleViewService.showLastProvider("terminal");
                }
                r();
            }));
            disposables.add(Event.once(pick.onDidAccept)(() => {
                if (this._terminalScrollStateSaved) {
                    const markTracker = this._instance?.xterm?.markTracker;
                    if (markTracker) {
                        markTracker.restoreScrollState();
                        markTracker.clear();
                        this._terminalScrollStateSaved = false;
                    }
                }
                accepted = true;
                const event = new TerminalLinkQuickPickEvent(EventType.CLICK);
                const activeItem = pick.activeItems?.[0];
                if (activeItem && 'link' in activeItem) {
                    activeItem.link.activate(event, activeItem.label);
                }
                disposables.dispose();
                r();
            }));
        });
    }
    async _generatePicks(links, ignoreLinks) {
        if (!links) {
            return;
        }
        const linkTextKeys = new Set();
        const linkUriKeys = new Set();
        const picks = [];
        for (const link of links) {
            let label = link.text;
            if (!linkTextKeys.has(label) && (!ignoreLinks || !ignoreLinks.some(e => e.text === label))) {
                linkTextKeys.add(label);
                let description;
                if ('uri' in link && link.uri) {
                    if (link.type === "LocalFile" ||
                        link.type === "LocalFolderInWorkspace" ||
                        link.type === "LocalFolderOutsideWorkspace") {
                        label = basenameOrAuthority(link.uri);
                        description = this._labelService.getUriLabel(dirname(link.uri), { relative: true });
                    }
                    if (link.type === "LocalFile") {
                        if (link.parsedLink?.suffix?.row !== undefined) {
                            label += `:${link.parsedLink.suffix.row}`;
                            if (link.parsedLink?.suffix?.rowEnd !== undefined) {
                                label += `-${link.parsedLink.suffix.rowEnd}`;
                            }
                            if (link.parsedLink?.suffix?.col !== undefined) {
                                label += `:${link.parsedLink.suffix.col}`;
                                if (link.parsedLink?.suffix?.colEnd !== undefined) {
                                    label += `-${link.parsedLink.suffix.colEnd}`;
                                }
                            }
                        }
                    }
                    if (linkUriKeys.has(label + '|' + (description ?? ''))) {
                        continue;
                    }
                    linkUriKeys.add(label + '|' + (description ?? ''));
                }
                picks.push({ label, link, description });
            }
        }
        return picks.length > 0 ? picks : undefined;
    }
    _previewItem(item) {
        if (!item || !('link' in item) || !item.link) {
            return;
        }
        const link = item.link;
        this._previewItemInTerminal(link);
        if (!('uri' in link) || !link.uri) {
            return;
        }
        if (link.type !== "LocalFile") {
            return;
        }
        this._previewItemInEditor(link);
    }
    _previewItemInEditor(link) {
        const linkSuffix = link.parsedLink ? link.parsedLink.suffix : getLinkSuffix(link.text);
        const selection = linkSuffix?.row === undefined ? undefined : {
            startLineNumber: linkSuffix.row ?? 1,
            startColumn: linkSuffix.col ?? 1,
            endLineNumber: linkSuffix.rowEnd,
            endColumn: linkSuffix.colEnd
        };
        this._editorViewState.set();
        this._editorSequencer.queue(async () => {
            await this._editorViewState.openTransientEditor({
                resource: link.uri,
                options: { preserveFocus: true, revealIfOpened: true, ignoreError: true, selection, }
            });
        });
    }
    _previewItemInTerminal(link) {
        const xterm = this._instance?.xterm;
        if (!xterm) {
            return;
        }
        if (!this._terminalScrollStateSaved) {
            xterm.markTracker.saveScrollState();
            this._terminalScrollStateSaved = true;
        }
        xterm.markTracker.revealRange(link.range);
    }
};
TerminalLinkQuickpick = __decorate([
    __param(0, ILabelService),
    __param(1, IQuickInputService),
    __param(2, IAccessibleViewService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TerminalLinkQuickpick);
export { TerminalLinkQuickpick };
