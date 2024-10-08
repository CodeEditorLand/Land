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
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { SimpleIconLabel } from '../../../../base/browser/ui/iconLabel/simpleIconLabel.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ShowTooltipCommand, StatusbarEntryKinds } from '../../../services/statusbar/browser/statusbar.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { isThemeColor } from '../../../../editor/common/editorCommon.js';
import { addDisposableListener, EventType, hide, show, append, EventHelper } from '../../../../base/browser/dom.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { renderIcon, renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { spinningLoading, syncing } from '../../../../platform/theme/common/iconRegistry.js';
import { isMarkdownString, markdownStringEqual } from '../../../../base/common/htmlContent.js';
import { Gesture, EventType as TouchEventType } from '../../../../base/browser/touch.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
let StatusbarEntryItem = class StatusbarEntryItem extends Disposable {
    get name() {
        return assertIsDefined(this.entry).name;
    }
    get hasCommand() {
        return typeof this.entry?.command !== 'undefined';
    }
    constructor(container, entry, hoverDelegate, commandService, hoverService, notificationService, telemetryService, themeService) {
        super();
        this.container = container;
        this.hoverDelegate = hoverDelegate;
        this.commandService = commandService;
        this.hoverService = hoverService;
        this.notificationService = notificationService;
        this.telemetryService = telemetryService;
        this.themeService = themeService;
        this.entry = undefined;
        this.foregroundListener = this._register(new MutableDisposable());
        this.backgroundListener = this._register(new MutableDisposable());
        this.commandMouseListener = this._register(new MutableDisposable());
        this.commandTouchListener = this._register(new MutableDisposable());
        this.commandKeyboardListener = this._register(new MutableDisposable());
        this.hover = undefined;
        // Label Container
        this.labelContainer = document.createElement('a');
        this.labelContainer.tabIndex = -1; // allows screen readers to read title, but still prevents tab focus.
        this.labelContainer.setAttribute('role', 'button');
        this.labelContainer.className = 'statusbar-item-label';
        this._register(Gesture.addTarget(this.labelContainer)); // enable touch
        // Label (with support for progress)
        this.label = this._register(new StatusBarCodiconLabel(this.labelContainer));
        this.container.appendChild(this.labelContainer);
        // Beak Container
        this.beakContainer = document.createElement('div');
        this.beakContainer.className = 'status-bar-item-beak-container';
        this.container.appendChild(this.beakContainer);
        this.update(entry);
    }
    update(entry) {
        // Update: Progress
        this.label.showProgress = entry.showProgress ?? false;
        // Update: Text
        if (!this.entry || entry.text !== this.entry.text) {
            this.label.text = entry.text;
            if (entry.text) {
                show(this.labelContainer);
            }
            else {
                hide(this.labelContainer);
            }
        }
        // Update: ARIA label
        //
        // Set the aria label on both elements so screen readers would read
        // the correct thing without duplication #96210
        if (!this.entry || entry.ariaLabel !== this.entry.ariaLabel) {
            this.container.setAttribute('aria-label', entry.ariaLabel);
            this.labelContainer.setAttribute('aria-label', entry.ariaLabel);
        }
        if (!this.entry || entry.role !== this.entry.role) {
            this.labelContainer.setAttribute('role', entry.role || 'button');
        }
        // Update: Hover
        if (!this.entry || !this.isEqualTooltip(this.entry, entry)) {
            const hoverContents = isMarkdownString(entry.tooltip) ? { markdown: entry.tooltip, markdownNotSupportedFallback: undefined } : entry.tooltip;
            if (this.hover) {
                this.hover.update(hoverContents);
            }
            else {
                this.hover = this._register(this.hoverService.setupManagedHover(this.hoverDelegate, this.container, hoverContents));
            }
        }
        // Update: Command
        if (!this.entry || entry.command !== this.entry.command) {
            this.commandMouseListener.clear();
            this.commandTouchListener.clear();
            this.commandKeyboardListener.clear();
            const command = entry.command;
            if (command && (command !== ShowTooltipCommand || this.hover) /* "Show Hover" is only valid when we have a hover */) {
                this.commandMouseListener.value = addDisposableListener(this.labelContainer, EventType.CLICK, () => this.executeCommand(command));
                this.commandTouchListener.value = addDisposableListener(this.labelContainer, TouchEventType.Tap, () => this.executeCommand(command));
                this.commandKeyboardListener.value = addDisposableListener(this.labelContainer, EventType.KEY_DOWN, e => {
                    const event = new StandardKeyboardEvent(e);
                    if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                        EventHelper.stop(e);
                        this.executeCommand(command);
                    }
                    else if (event.equals(9 /* KeyCode.Escape */) || event.equals(15 /* KeyCode.LeftArrow */) || event.equals(17 /* KeyCode.RightArrow */)) {
                        EventHelper.stop(e);
                        this.hover?.hide();
                    }
                });
                this.labelContainer.classList.remove('disabled');
            }
            else {
                this.labelContainer.classList.add('disabled');
            }
        }
        // Update: Beak
        if (!this.entry || entry.showBeak !== this.entry.showBeak) {
            if (entry.showBeak) {
                this.container.classList.add('has-beak');
            }
            else {
                this.container.classList.remove('has-beak');
            }
        }
        const hasBackgroundColor = !!entry.backgroundColor || (entry.kind && entry.kind !== 'standard');
        // Update: Kind
        if (!this.entry || entry.kind !== this.entry.kind) {
            for (const kind of StatusbarEntryKinds) {
                this.container.classList.remove(`${kind}-kind`);
            }
            if (entry.kind && entry.kind !== 'standard') {
                this.container.classList.add(`${entry.kind}-kind`);
            }
            this.container.classList.toggle('has-background-color', hasBackgroundColor);
        }
        // Update: Foreground
        if (!this.entry || entry.color !== this.entry.color) {
            this.applyColor(this.labelContainer, entry.color);
        }
        // Update: Background
        if (!this.entry || entry.backgroundColor !== this.entry.backgroundColor) {
            this.container.classList.toggle('has-background-color', hasBackgroundColor);
            this.applyColor(this.container, entry.backgroundColor, true);
        }
        // Remember for next round
        this.entry = entry;
    }
    isEqualTooltip({ tooltip }, { tooltip: otherTooltip }) {
        if (tooltip === undefined) {
            return otherTooltip === undefined;
        }
        if (isMarkdownString(tooltip)) {
            return isMarkdownString(otherTooltip) && markdownStringEqual(tooltip, otherTooltip);
        }
        return tooltip === otherTooltip;
    }
    async executeCommand(command) {
        // Custom command from us: Show tooltip
        if (command === ShowTooltipCommand) {
            this.hover?.show(true /* focus */);
        }
        // Any other command is going through command service
        else {
            const id = typeof command === 'string' ? command : command.id;
            const args = typeof command === 'string' ? [] : command.arguments ?? [];
            this.telemetryService.publicLog2('workbenchActionExecuted', { id, from: 'status bar' });
            try {
                await this.commandService.executeCommand(id, ...args);
            }
            catch (error) {
                this.notificationService.error(toErrorMessage(error));
            }
        }
    }
    applyColor(container, color, isBackground) {
        let colorResult = undefined;
        if (isBackground) {
            this.backgroundListener.clear();
        }
        else {
            this.foregroundListener.clear();
        }
        if (color) {
            if (isThemeColor(color)) {
                colorResult = this.themeService.getColorTheme().getColor(color.id)?.toString();
                const listener = this.themeService.onDidColorThemeChange(theme => {
                    const colorValue = theme.getColor(color.id)?.toString();
                    if (isBackground) {
                        container.style.backgroundColor = colorValue ?? '';
                    }
                    else {
                        container.style.color = colorValue ?? '';
                    }
                });
                if (isBackground) {
                    this.backgroundListener.value = listener;
                }
                else {
                    this.foregroundListener.value = listener;
                }
            }
            else {
                colorResult = color;
            }
        }
        if (isBackground) {
            container.style.backgroundColor = colorResult ?? '';
        }
        else {
            container.style.color = colorResult ?? '';
        }
    }
};
StatusbarEntryItem = __decorate([
    __param(3, ICommandService),
    __param(4, IHoverService),
    __param(5, INotificationService),
    __param(6, ITelemetryService),
    __param(7, IThemeService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object, Object])
], StatusbarEntryItem);
export { StatusbarEntryItem };
class StatusBarCodiconLabel extends SimpleIconLabel {
    constructor(container) {
        super(container);
        this.container = container;
        this.progressCodicon = renderIcon(syncing);
        this.currentText = '';
        this.currentShowProgress = false;
    }
    set showProgress(showProgress) {
        if (this.currentShowProgress !== showProgress) {
            this.currentShowProgress = showProgress;
            this.progressCodicon = renderIcon(showProgress === 'syncing' ? syncing : spinningLoading);
            this.text = this.currentText;
        }
    }
    set text(text) {
        // Progress: insert progress codicon as first element as needed
        // but keep it stable so that the animation does not reset
        if (this.currentShowProgress) {
            // Append as needed
            if (this.container.firstChild !== this.progressCodicon) {
                this.container.appendChild(this.progressCodicon);
            }
            // Remove others
            for (const node of Array.from(this.container.childNodes)) {
                if (node !== this.progressCodicon) {
                    node.remove();
                }
            }
            // If we have text to show, add a space to separate from progress
            let textContent = text ?? '';
            if (textContent) {
                textContent = ` ${textContent}`;
            }
            // Append new elements
            append(this.container, ...renderLabelWithIcons(textContent));
        }
        // No Progress: no special handling
        else {
            super.text = text;
        }
    }
}
