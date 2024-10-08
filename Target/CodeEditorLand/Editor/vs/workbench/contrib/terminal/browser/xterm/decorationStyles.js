/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import * as dom from '../../../../../base/browser/dom.js';
import { Delayer } from '../../../../../base/common/async.js';
import { fromNow, getDurationString } from '../../../../../base/common/date.js';
import { MarkdownString } from '../../../../../base/common/htmlContent.js';
import { combinedDisposable, Disposable } from '../../../../../base/common/lifecycle.js';
import { localize } from '../../../../../nls.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
let TerminalDecorationHoverManager = class TerminalDecorationHoverManager extends Disposable {
    constructor(_hoverService, configurationService, contextMenuService) {
        super();
        this._hoverService = _hoverService;
        this._contextMenuVisible = false;
        this._register(contextMenuService.onDidShowContextMenu(() => this._contextMenuVisible = true));
        this._register(contextMenuService.onDidHideContextMenu(() => this._contextMenuVisible = false));
        this._hoverDelayer = this._register(new Delayer(configurationService.getValue('workbench.hover.delay')));
    }
    hideHover() {
        this._hoverDelayer.cancel();
        this._hoverService.hideHover();
    }
    createHover(element, command, hoverMessage) {
        return combinedDisposable(dom.addDisposableListener(element, dom.EventType.MOUSE_ENTER, () => {
            if (this._contextMenuVisible) {
                return;
            }
            this._hoverDelayer.trigger(() => {
                let hoverContent = `${localize('terminalPromptContextMenu', "Show Command Actions")}`;
                hoverContent += '\n\n---\n\n';
                if (!command) {
                    if (hoverMessage) {
                        hoverContent = hoverMessage;
                    }
                    else {
                        return;
                    }
                }
                else if (command.markProperties || hoverMessage) {
                    if (command.markProperties?.hoverMessage || hoverMessage) {
                        hoverContent = command.markProperties?.hoverMessage || hoverMessage || '';
                    }
                    else {
                        return;
                    }
                }
                else {
                    if (command.duration) {
                        const durationText = getDurationString(command.duration);
                        if (command.exitCode) {
                            if (command.exitCode === -1) {
                                hoverContent += localize('terminalPromptCommandFailed.duration', 'Command executed {0}, took {1} and failed', fromNow(command.timestamp, true), durationText);
                            }
                            else {
                                hoverContent += localize('terminalPromptCommandFailedWithExitCode.duration', 'Command executed {0}, took {1} and failed (Exit Code {2})', fromNow(command.timestamp, true), durationText, command.exitCode);
                            }
                        }
                        else {
                            hoverContent += localize('terminalPromptCommandSuccess.duration', 'Command executed {0} and took {1}', fromNow(command.timestamp, true), durationText);
                        }
                    }
                    else {
                        if (command.exitCode) {
                            if (command.exitCode === -1) {
                                hoverContent += localize('terminalPromptCommandFailed', 'Command executed {0} and failed', fromNow(command.timestamp, true));
                            }
                            else {
                                hoverContent += localize('terminalPromptCommandFailedWithExitCode', 'Command executed {0} and failed (Exit Code {1})', fromNow(command.timestamp, true), command.exitCode);
                            }
                        }
                        else {
                            hoverContent += localize('terminalPromptCommandSuccess', 'Command executed {0}', fromNow(command.timestamp, true));
                        }
                    }
                }
                this._hoverService.showHover({ content: new MarkdownString(hoverContent), target: element });
            });
        }), dom.addDisposableListener(element, dom.EventType.MOUSE_LEAVE, () => this.hideHover()), dom.addDisposableListener(element, dom.EventType.MOUSE_OUT, () => this.hideHover()));
    }
};
TerminalDecorationHoverManager = __decorate([
    __param(0, IHoverService),
    __param(1, IConfigurationService),
    __param(2, IContextMenuService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TerminalDecorationHoverManager);
export { TerminalDecorationHoverManager };
export function updateLayout(configurationService, element) {
    if (!element) {
        return;
    }
    const fontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).value;
    const defaultFontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).defaultValue;
    const lineHeight = configurationService.inspect("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */).value;
    if (typeof fontSize === 'number' && typeof defaultFontSize === 'number' && typeof lineHeight === 'number') {
        const scalar = (fontSize / defaultFontSize) <= 1 ? (fontSize / defaultFontSize) : 1;
        // must be inlined to override the inlined styles from xterm
        element.style.width = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
        element.style.height = `${scalar * 16 /* DecorationStyles.DefaultDimension */ * lineHeight}px`;
        element.style.fontSize = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
        element.style.marginLeft = `${scalar * -17 /* DecorationStyles.MarginLeft */}px`;
    }
}
