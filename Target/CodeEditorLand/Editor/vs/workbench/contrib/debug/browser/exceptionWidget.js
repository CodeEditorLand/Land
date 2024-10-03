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
import './media/exceptionWidget.css';
import * as nls from '../../../../nls.js';
import * as dom from '../../../../base/browser/dom.js';
import { ZoneWidget } from '../../../../editor/contrib/zoneWidget/browser/zoneWidget.js';
import { EDITOR_CONTRIBUTION_ID } from '../common/debug.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { registerColor } from '../../../../platform/theme/common/colorRegistry.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { LinkDetector } from './linkDetector.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { Action } from '../../../../base/common/actions.js';
import { widgetClose } from '../../../../platform/theme/common/iconRegistry.js';
const $ = dom.$;
const debugExceptionWidgetBorder = registerColor('debugExceptionWidget.border', '#a31515', nls.localize('debugExceptionWidgetBorder', 'Exception widget border color.'));
const debugExceptionWidgetBackground = registerColor('debugExceptionWidget.background', { dark: '#420b0d', light: '#f1dfde', hcDark: '#420b0d', hcLight: '#f1dfde' }, nls.localize('debugExceptionWidgetBackground', 'Exception widget background color.'));
let ExceptionWidget = class ExceptionWidget extends ZoneWidget {
    constructor(editor, exceptionInfo, debugSession, themeService, instantiationService) {
        super(editor, { showFrame: true, showArrow: true, isAccessible: true, frameWidth: 1, className: 'exception-widget-container' });
        this.exceptionInfo = exceptionInfo;
        this.debugSession = debugSession;
        this.instantiationService = instantiationService;
        this.applyTheme(themeService.getColorTheme());
        this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme.bind(this)));
        this.create();
        const onDidLayoutChangeScheduler = new RunOnceScheduler(() => this._doLayout(undefined, undefined), 50);
        this._disposables.add(this.editor.onDidLayoutChange(() => onDidLayoutChangeScheduler.schedule()));
        this._disposables.add(onDidLayoutChangeScheduler);
    }
    applyTheme(theme) {
        this.backgroundColor = theme.getColor(debugExceptionWidgetBackground);
        const frameColor = theme.getColor(debugExceptionWidgetBorder);
        this.style({
            arrowColor: frameColor,
            frameColor: frameColor
        });
    }
    _applyStyles() {
        if (this.container) {
            this.container.style.backgroundColor = this.backgroundColor ? this.backgroundColor.toString() : '';
        }
        super._applyStyles();
    }
    _fillContainer(container) {
        this.setCssClass('exception-widget');
        const fontInfo = this.editor.getOption(52);
        container.style.fontSize = `${fontInfo.fontSize}px`;
        container.style.lineHeight = `${fontInfo.lineHeight}px`;
        container.tabIndex = 0;
        const title = $('.title');
        const label = $('.label');
        dom.append(title, label);
        const actions = $('.actions');
        dom.append(title, actions);
        label.textContent = this.exceptionInfo.id ? nls.localize('exceptionThrownWithId', 'Exception has occurred: {0}', this.exceptionInfo.id) : nls.localize('exceptionThrown', 'Exception has occurred.');
        let ariaLabel = label.textContent;
        const actionBar = new ActionBar(actions);
        actionBar.push(new Action('editor.closeExceptionWidget', nls.localize('close', "Close"), ThemeIcon.asClassName(widgetClose), true, async () => {
            const contribution = this.editor.getContribution(EDITOR_CONTRIBUTION_ID);
            contribution?.closeExceptionWidget();
        }), { label: false, icon: true });
        dom.append(container, title);
        if (this.exceptionInfo.description) {
            const description = $('.description');
            description.textContent = this.exceptionInfo.description;
            ariaLabel += ', ' + this.exceptionInfo.description;
            dom.append(container, description);
        }
        if (this.exceptionInfo.details && this.exceptionInfo.details.stackTrace) {
            const stackTrace = $('.stack-trace');
            const linkDetector = this.instantiationService.createInstance(LinkDetector);
            const linkedStackTrace = linkDetector.linkify(this.exceptionInfo.details.stackTrace, true, this.debugSession ? this.debugSession.root : undefined, undefined, { type: 0, store: this._disposables });
            stackTrace.appendChild(linkedStackTrace);
            dom.append(container, stackTrace);
            ariaLabel += ', ' + this.exceptionInfo.details.stackTrace;
        }
        container.setAttribute('aria-label', ariaLabel);
    }
    _doLayout(_heightInPixel, _widthInPixel) {
        this.container.style.height = 'initial';
        const lineHeight = this.editor.getOption(69);
        const arrowHeight = Math.round(lineHeight / 3);
        const computedLinesNumber = Math.ceil((this.container.offsetHeight + arrowHeight) / lineHeight);
        this._relayout(computedLinesNumber);
    }
    focus() {
        this.container?.focus();
    }
    hasFocus() {
        if (!this.container) {
            return false;
        }
        return dom.isAncestorOfActiveElement(this.container);
    }
};
ExceptionWidget = __decorate([
    __param(3, IThemeService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ExceptionWidget);
export { ExceptionWidget };
