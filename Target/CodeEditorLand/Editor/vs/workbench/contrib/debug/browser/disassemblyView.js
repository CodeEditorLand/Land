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
var DisassemblyView_1, BreakpointRenderer_1, InstructionRenderer_1;
import { PixelRatio } from '../../../../base/browser/pixelRatio.js';
import { $, addStandardDisposableListener, append } from '../../../../base/browser/dom.js';
import { binarySearch2 } from '../../../../base/common/arrays.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, dispose } from '../../../../base/common/lifecycle.js';
import { isAbsolute } from '../../../../base/common/path.js';
import { URI } from '../../../../base/common/uri.js';
import { applyFontInfo } from '../../../../editor/browser/config/domFontInfo.js';
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { BareFontInfo } from '../../../../editor/common/config/fontInfo.js';
import { Range } from '../../../../editor/common/core/range.js';
import { StringBuilder } from '../../../../editor/common/core/stringBuilder.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { WorkbenchTable } from '../../../../platform/list/browser/listService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { editorBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { focusedStackFrameColor, topStackFrameColor } from './callStackEditorContribution.js';
import * as icons from './debugIcons.js';
import { CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST, DISASSEMBLY_VIEW_ID, IDebugService } from '../common/debug.js';
import { InstructionBreakpoint } from '../common/debugModel.js';
import { getUriFromSource } from '../common/debugSource.js';
import { isUri, sourcesEqual } from '../common/debugUtils.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
// Special entry as a placeholer when disassembly is not available
const disassemblyNotAvailable = {
    allowBreakpoint: false,
    isBreakpointSet: false,
    isBreakpointEnabled: false,
    instructionReference: '',
    instructionOffset: 0,
    instructionReferenceOffset: 0,
    address: 0n,
    instruction: {
        address: '-1',
        instruction: localize('instructionNotAvailable', "Disassembly not available.")
    },
};
let DisassemblyView = class DisassemblyView extends EditorPane {
    static { DisassemblyView_1 = this; }
    static { this.NUM_INSTRUCTIONS_TO_LOAD = 50; }
    constructor(group, telemetryService, themeService, storageService, _configurationService, _instantiationService, _debugService) {
        super(DISASSEMBLY_VIEW_ID, group, telemetryService, themeService, storageService);
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._debugService = _debugService;
        this._instructionBpList = [];
        this._enableSourceCodeRender = true;
        this._loadingLock = false;
        this._referenceToMemoryAddress = new Map();
        this._disassembledInstructions = undefined;
        this._onDidChangeStackFrame = this._register(new Emitter({ leakWarningThreshold: 1000 }));
        this._previousDebuggingState = _debugService.state;
        this._register(_configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('debug')) {
                // show/hide source code requires changing height which WorkbenchTable doesn't support dynamic height, thus force a total reload.
                const newValue = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
                if (this._enableSourceCodeRender !== newValue) {
                    this._enableSourceCodeRender = newValue;
                    // todo: trigger rerender
                }
                else {
                    this._disassembledInstructions?.rerender();
                }
            }
        }));
    }
    get fontInfo() {
        if (!this._fontInfo) {
            this._fontInfo = this.createFontInfo();
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor')) {
                    this._fontInfo = this.createFontInfo();
                }
            }));
        }
        return this._fontInfo;
    }
    createFontInfo() {
        return BareFontInfo.createFromRawSettings(this._configurationService.getValue('editor'), PixelRatio.getInstance(this.window).value);
    }
    get currentInstructionAddresses() {
        return this._debugService.getModel().getSessions(false).
            map(session => session.getAllThreads()).
            reduce((prev, curr) => prev.concat(curr), []).
            map(thread => thread.getTopStackFrame()).
            map(frame => frame?.instructionPointerReference).
            map(ref => ref ? this.getReferenceAddress(ref) : undefined);
    }
    // Instruction reference of the top stack frame of the focused stack
    get focusedCurrentInstructionReference() {
        return this._debugService.getViewModel().focusedStackFrame?.thread.getTopStackFrame()?.instructionPointerReference;
    }
    get focusedCurrentInstructionAddress() {
        const ref = this.focusedCurrentInstructionReference;
        return ref ? this.getReferenceAddress(ref) : undefined;
    }
    get focusedInstructionReference() {
        return this._debugService.getViewModel().focusedStackFrame?.instructionPointerReference;
    }
    get focusedInstructionAddress() {
        const ref = this.focusedInstructionReference;
        return ref ? this.getReferenceAddress(ref) : undefined;
    }
    get isSourceCodeRender() { return this._enableSourceCodeRender; }
    get debugSession() {
        return this._debugService.getViewModel().focusedSession;
    }
    get onDidChangeStackFrame() { return this._onDidChangeStackFrame.event; }
    get focusedAddressAndOffset() {
        const element = this._disassembledInstructions?.getFocusedElements()[0];
        if (!element) {
            return undefined;
        }
        const reference = element.instructionReference;
        const offset = Number(element.address - this.getReferenceAddress(reference));
        return { reference, offset, address: element.address };
    }
    createEditor(parent) {
        this._enableSourceCodeRender = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
        const lineHeight = this.fontInfo.lineHeight;
        const thisOM = this;
        const delegate = new class {
            constructor() {
                this.headerRowHeight = 0; // No header
            }
            getHeight(row) {
                if (thisOM.isSourceCodeRender && row.showSourceLocation && row.instruction.location?.path && row.instruction.line) {
                    // instruction line + source lines
                    if (row.instruction.endLine) {
                        return lineHeight * (row.instruction.endLine - row.instruction.line + 2);
                    }
                    else {
                        // source is only a single line.
                        return lineHeight * 2;
                    }
                }
                // just instruction line
                return lineHeight;
            }
        };
        const instructionRenderer = this._register(this._instantiationService.createInstance(InstructionRenderer, this));
        this._disassembledInstructions = this._register(this._instantiationService.createInstance(WorkbenchTable, 'DisassemblyView', parent, delegate, [
            {
                label: '',
                tooltip: '',
                weight: 0,
                minimumWidth: this.fontInfo.lineHeight,
                maximumWidth: this.fontInfo.lineHeight,
                templateId: BreakpointRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
            {
                label: localize('disassemblyTableColumnLabel', "instructions"),
                tooltip: '',
                weight: 0.3,
                templateId: InstructionRenderer.TEMPLATE_ID,
                project(row) { return row; }
            },
        ], [
            this._instantiationService.createInstance(BreakpointRenderer, this),
            instructionRenderer,
        ], {
            identityProvider: { getId: (e) => e.instruction.address },
            horizontalScrolling: false,
            overrideStyles: {
                listBackground: editorBackground
            },
            multipleSelectionSupport: false,
            setRowLineHeight: false,
            openOnSingleClick: false,
            accessibilityProvider: new AccessibilityProvider(),
            mouseSupport: false
        }));
        this._disassembledInstructions.domNode.classList.add('disassembly-view');
        if (this.focusedInstructionReference) {
            this.reloadDisassembly(this.focusedInstructionReference, 0);
        }
        this._register(this._disassembledInstructions.onDidScroll(e => {
            if (this._loadingLock) {
                return;
            }
            if (e.oldScrollTop > e.scrollTop && e.scrollTop < e.height) {
                this._loadingLock = true;
                const prevTop = Math.floor(e.scrollTop / this.fontInfo.lineHeight);
                this.scrollUp_LoadDisassembledInstructions(DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD).then((loaded) => {
                    if (loaded > 0) {
                        this._disassembledInstructions.reveal(prevTop + loaded, 0);
                    }
                    this._loadingLock = false;
                });
            }
            else if (e.oldScrollTop < e.scrollTop && e.scrollTop + e.height > e.scrollHeight - e.height) {
                this._loadingLock = true;
                this.scrollDown_LoadDisassembledInstructions(DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD).then(() => { this._loadingLock = false; });
            }
        }));
        this._register(this._debugService.getViewModel().onDidFocusStackFrame(({ stackFrame }) => {
            if (this._disassembledInstructions && stackFrame?.instructionPointerReference) {
                this.goToInstructionAndOffset(stackFrame.instructionPointerReference, 0);
            }
            this._onDidChangeStackFrame.fire();
        }));
        // refresh breakpoints view
        this._register(this._debugService.getModel().onDidChangeBreakpoints(bpEvent => {
            if (bpEvent && this._disassembledInstructions) {
                // draw viewable BP
                let changed = false;
                bpEvent.added?.forEach((bp) => {
                    if (bp instanceof InstructionBreakpoint) {
                        const index = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
                        if (index >= 0) {
                            this._disassembledInstructions.row(index).isBreakpointSet = true;
                            this._disassembledInstructions.row(index).isBreakpointEnabled = bp.enabled;
                            changed = true;
                        }
                    }
                });
                bpEvent.removed?.forEach((bp) => {
                    if (bp instanceof InstructionBreakpoint) {
                        const index = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
                        if (index >= 0) {
                            this._disassembledInstructions.row(index).isBreakpointSet = false;
                            changed = true;
                        }
                    }
                });
                bpEvent.changed?.forEach((bp) => {
                    if (bp instanceof InstructionBreakpoint) {
                        const index = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
                        if (index >= 0) {
                            if (this._disassembledInstructions.row(index).isBreakpointEnabled !== bp.enabled) {
                                this._disassembledInstructions.row(index).isBreakpointEnabled = bp.enabled;
                                changed = true;
                            }
                        }
                    }
                });
                // get an updated list so that items beyond the current range would render when reached.
                this._instructionBpList = this._debugService.getModel().getInstructionBreakpoints();
                // breakpoints restored from a previous session can be based on memory
                // references that may no longer exist in the current session. Request
                // those instructions to be loaded so the BP can be displayed.
                for (const bp of this._instructionBpList) {
                    this.primeMemoryReference(bp.instructionReference);
                }
                if (changed) {
                    this._onDidChangeStackFrame.fire();
                }
            }
        }));
        this._register(this._debugService.onDidChangeState(e => {
            if ((e === 3 /* State.Running */ || e === 2 /* State.Stopped */) &&
                (this._previousDebuggingState !== 3 /* State.Running */ && this._previousDebuggingState !== 2 /* State.Stopped */)) {
                // Just started debugging, clear the view
                this.clear();
                this._enableSourceCodeRender = this._configurationService.getValue('debug').disassemblyView.showSourceCode;
            }
            this._previousDebuggingState = e;
            this._onDidChangeStackFrame.fire();
        }));
    }
    layout(dimension) {
        this._disassembledInstructions?.layout(dimension.height);
    }
    async goToInstructionAndOffset(instructionReference, offset, focus) {
        let addr = this._referenceToMemoryAddress.get(instructionReference);
        if (addr === undefined) {
            await this.loadDisassembledInstructions(instructionReference, 0, -DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD, DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD * 2);
            addr = this._referenceToMemoryAddress.get(instructionReference);
        }
        if (addr) {
            this.goToAddress(addr + BigInt(offset), focus);
        }
    }
    /** Gets the address associated with the instruction reference. */
    getReferenceAddress(instructionReference) {
        return this._referenceToMemoryAddress.get(instructionReference);
    }
    /**
     * Go to the address provided. If no address is provided, reveal the address of the currently focused stack frame. Returns false if that address is not available.
     */
    goToAddress(address, focus) {
        if (!this._disassembledInstructions) {
            return false;
        }
        if (!address) {
            return false;
        }
        const index = this.getIndexFromAddress(address);
        if (index >= 0) {
            this._disassembledInstructions.reveal(index);
            if (focus) {
                this._disassembledInstructions.domFocus();
                this._disassembledInstructions.setFocus([index]);
            }
            return true;
        }
        return false;
    }
    async scrollUp_LoadDisassembledInstructions(instructionCount) {
        const first = this._disassembledInstructions?.row(0);
        if (first) {
            return this.loadDisassembledInstructions(first.instructionReference, first.instructionReferenceOffset, first.instructionOffset - instructionCount, instructionCount);
        }
        return 0;
    }
    async scrollDown_LoadDisassembledInstructions(instructionCount) {
        const last = this._disassembledInstructions?.row(this._disassembledInstructions?.length - 1);
        if (last) {
            return this.loadDisassembledInstructions(last.instructionReference, last.instructionReferenceOffset, last.instructionOffset + 1, instructionCount);
        }
        return 0;
    }
    /**
     * Sets the memory reference address. We don't just loadDisassembledInstructions
     * for this, since we can't really deal with discontiguous ranges (we can't
     * detect _if_ a range is discontiguous since we don't know how much memory
     * comes between instructions.)
     */
    async primeMemoryReference(instructionReference) {
        if (this._referenceToMemoryAddress.has(instructionReference)) {
            return true;
        }
        const s = await this.debugSession?.disassemble(instructionReference, 0, 0, 1);
        if (s && s.length > 0) {
            try {
                this._referenceToMemoryAddress.set(instructionReference, BigInt(s[0].address));
                return true;
            }
            catch {
                return false;
            }
        }
        return false;
    }
    /** Loads disasembled instructions. Returns the number of instructions that were loaded. */
    async loadDisassembledInstructions(instructionReference, offset, instructionOffset, instructionCount) {
        const session = this.debugSession;
        const resultEntries = await session?.disassemble(instructionReference, offset, instructionOffset, instructionCount);
        // Ensure we always load the baseline instructions so we know what address the instructionReference refers to.
        if (!this._referenceToMemoryAddress.has(instructionReference) && instructionOffset !== 0) {
            await this.loadDisassembledInstructions(instructionReference, 0, 0, DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD);
        }
        if (session && resultEntries && this._disassembledInstructions) {
            const newEntries = [];
            let lastLocation;
            let lastLine;
            for (let i = 0; i < resultEntries.length; i++) {
                const instruction = resultEntries[i];
                const thisInstructionOffset = instructionOffset + i;
                // Forward fill the missing location as detailed in the DAP spec.
                if (instruction.location) {
                    lastLocation = instruction.location;
                    lastLine = undefined;
                }
                if (instruction.line) {
                    const currentLine = {
                        startLineNumber: instruction.line,
                        startColumn: instruction.column ?? 0,
                        endLineNumber: instruction.endLine ?? instruction.line,
                        endColumn: instruction.endColumn ?? 0,
                    };
                    // Add location only to the first unique range. This will give the appearance of grouping of instructions.
                    if (!Range.equalsRange(currentLine, lastLine ?? null)) {
                        lastLine = currentLine;
                        instruction.location = lastLocation;
                    }
                }
                let address;
                try {
                    address = BigInt(instruction.address);
                }
                catch {
                    console.error(`Could not parse disassembly address ${instruction.address} (in ${JSON.stringify(instruction)})`);
                    continue;
                }
                const entry = {
                    allowBreakpoint: true,
                    isBreakpointSet: false,
                    isBreakpointEnabled: false,
                    instructionReference,
                    instructionReferenceOffset: offset,
                    instructionOffset: thisInstructionOffset,
                    instruction,
                    address,
                };
                newEntries.push(entry);
                // if we just loaded the first instruction for this reference, mark its address.
                if (offset === 0 && thisInstructionOffset === 0) {
                    this._referenceToMemoryAddress.set(instructionReference, address);
                }
            }
            if (newEntries.length === 0) {
                return 0;
            }
            const refBaseAddress = this._referenceToMemoryAddress.get(instructionReference);
            const bps = this._instructionBpList.map(p => {
                const base = this._referenceToMemoryAddress.get(p.instructionReference);
                if (!base) {
                    return undefined;
                }
                return {
                    enabled: p.enabled,
                    address: base + BigInt(p.offset || 0),
                };
            });
            if (refBaseAddress !== undefined) {
                for (const entry of newEntries) {
                    const bp = bps.find(p => p?.address === entry.address);
                    if (bp) {
                        entry.isBreakpointSet = true;
                        entry.isBreakpointEnabled = bp.enabled;
                    }
                }
            }
            const da = this._disassembledInstructions;
            if (da.length === 1 && this._disassembledInstructions.row(0) === disassemblyNotAvailable) {
                da.splice(0, 1);
            }
            const firstAddr = newEntries[0].address;
            const lastAddr = newEntries[newEntries.length - 1].address;
            const startN = binarySearch2(da.length, i => Number(da.row(i).address - firstAddr));
            const start = startN < 0 ? ~startN : startN;
            const endN = binarySearch2(da.length, i => Number(da.row(i).address - lastAddr));
            const end = endN < 0 ? ~endN : endN + 1;
            const toDelete = end - start;
            // Go through everything we're about to add, and only show the source
            // location if it's different from the previous one, "grouping" instructions by line
            let lastLocated;
            for (let i = start - 1; i >= 0; i--) {
                const { instruction } = da.row(i);
                if (instruction.location && instruction.line !== undefined) {
                    lastLocated = instruction;
                    break;
                }
            }
            const shouldShowLocation = (instruction) => instruction.line !== undefined && instruction.location !== undefined &&
                (!lastLocated || !sourcesEqual(instruction.location, lastLocated.location) || instruction.line !== lastLocated.line);
            for (const entry of newEntries) {
                if (shouldShowLocation(entry.instruction)) {
                    entry.showSourceLocation = true;
                    lastLocated = entry.instruction;
                }
            }
            da.splice(start, toDelete, newEntries);
            return newEntries.length - toDelete;
        }
        return 0;
    }
    getIndexFromReferenceAndOffset(instructionReference, offset) {
        const addr = this._referenceToMemoryAddress.get(instructionReference);
        if (addr === undefined) {
            return -1;
        }
        return this.getIndexFromAddress(addr + BigInt(offset));
    }
    getIndexFromAddress(address) {
        const disassembledInstructions = this._disassembledInstructions;
        if (disassembledInstructions && disassembledInstructions.length > 0) {
            return binarySearch2(disassembledInstructions.length, index => {
                const row = disassembledInstructions.row(index);
                return Number(row.address - address);
            });
        }
        return -1;
    }
    /**
     * Clears the table and reload instructions near the target address
     */
    reloadDisassembly(instructionReference, offset) {
        if (!this._disassembledInstructions) {
            return;
        }
        this._loadingLock = true; // stop scrolling during the load.
        this.clear();
        this._instructionBpList = this._debugService.getModel().getInstructionBreakpoints();
        this.loadDisassembledInstructions(instructionReference, offset, -DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD * 4, DisassemblyView_1.NUM_INSTRUCTIONS_TO_LOAD * 8).then(() => {
            // on load, set the target instruction in the middle of the page.
            if (this._disassembledInstructions.length > 0) {
                const targetIndex = Math.floor(this._disassembledInstructions.length / 2);
                this._disassembledInstructions.reveal(targetIndex, 0.5);
                // Always focus the target address on reload, or arrow key navigation would look terrible
                this._disassembledInstructions.domFocus();
                this._disassembledInstructions.setFocus([targetIndex]);
            }
            this._loadingLock = false;
        });
    }
    clear() {
        this._referenceToMemoryAddress.clear();
        this._disassembledInstructions?.splice(0, this._disassembledInstructions.length, [disassemblyNotAvailable]);
    }
};
DisassemblyView = DisassemblyView_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IThemeService),
    __param(3, IStorageService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, IDebugService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], DisassemblyView);
export { DisassemblyView };
let BreakpointRenderer = class BreakpointRenderer {
    static { BreakpointRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'breakpoint'; }
    constructor(_disassemblyView, _debugService) {
        this._disassemblyView = _disassemblyView;
        this._debugService = _debugService;
        this.templateId = BreakpointRenderer_1.TEMPLATE_ID;
        this._breakpointIcon = 'codicon-' + icons.breakpoint.regular.id;
        this._breakpointDisabledIcon = 'codicon-' + icons.breakpoint.disabled.id;
        this._breakpointHintIcon = 'codicon-' + icons.debugBreakpointHint.id;
        this._debugStackframe = 'codicon-' + icons.debugStackframe.id;
        this._debugStackframeFocused = 'codicon-' + icons.debugStackframeFocused.id;
    }
    renderTemplate(container) {
        // align from the bottom so that it lines up with instruction when source code is present.
        container.style.alignSelf = 'flex-end';
        const icon = append(container, $('.codicon'));
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.height = this._disassemblyView.fontInfo.lineHeight + 'px';
        const currentElement = { element: undefined };
        const disposables = [
            this._disassemblyView.onDidChangeStackFrame(() => this.rerenderDebugStackframe(icon, currentElement.element)),
            addStandardDisposableListener(container, 'mouseover', () => {
                if (currentElement.element?.allowBreakpoint) {
                    icon.classList.add(this._breakpointHintIcon);
                }
            }),
            addStandardDisposableListener(container, 'mouseout', () => {
                if (currentElement.element?.allowBreakpoint) {
                    icon.classList.remove(this._breakpointHintIcon);
                }
            }),
            addStandardDisposableListener(container, 'click', () => {
                if (currentElement.element?.allowBreakpoint) {
                    // click show hint while waiting for BP to resolve.
                    icon.classList.add(this._breakpointHintIcon);
                    const reference = currentElement.element.instructionReference;
                    const offset = Number(currentElement.element.address - this._disassemblyView.getReferenceAddress(reference));
                    if (currentElement.element.isBreakpointSet) {
                        this._debugService.removeInstructionBreakpoints(reference, offset);
                    }
                    else if (currentElement.element.allowBreakpoint && !currentElement.element.isBreakpointSet) {
                        this._debugService.addInstructionBreakpoint({ instructionReference: reference, offset, address: currentElement.element.address, canPersist: false });
                    }
                }
            })
        ];
        return { currentElement, icon, disposables };
    }
    renderElement(element, index, templateData, height) {
        templateData.currentElement.element = element;
        this.rerenderDebugStackframe(templateData.icon, element);
    }
    disposeTemplate(templateData) {
        dispose(templateData.disposables);
        templateData.disposables = [];
    }
    rerenderDebugStackframe(icon, element) {
        if (element?.address === this._disassemblyView.focusedCurrentInstructionAddress) {
            icon.classList.add(this._debugStackframe);
        }
        else if (element?.address === this._disassemblyView.focusedInstructionAddress) {
            icon.classList.add(this._debugStackframeFocused);
        }
        else {
            icon.classList.remove(this._debugStackframe);
            icon.classList.remove(this._debugStackframeFocused);
        }
        icon.classList.remove(this._breakpointHintIcon);
        if (element?.isBreakpointSet) {
            if (element.isBreakpointEnabled) {
                icon.classList.add(this._breakpointIcon);
                icon.classList.remove(this._breakpointDisabledIcon);
            }
            else {
                icon.classList.remove(this._breakpointIcon);
                icon.classList.add(this._breakpointDisabledIcon);
            }
        }
        else {
            icon.classList.remove(this._breakpointIcon);
            icon.classList.remove(this._breakpointDisabledIcon);
        }
    }
};
BreakpointRenderer = BreakpointRenderer_1 = __decorate([
    __param(1, IDebugService),
    __metadata("design:paramtypes", [DisassemblyView, Object])
], BreakpointRenderer);
let InstructionRenderer = class InstructionRenderer extends Disposable {
    static { InstructionRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'instruction'; }
    static { this.INSTRUCTION_ADDR_MIN_LENGTH = 25; }
    static { this.INSTRUCTION_BYTES_MIN_LENGTH = 30; }
    constructor(_disassemblyView, themeService, editorService, textModelService, uriService, logService) {
        super();
        this._disassemblyView = _disassemblyView;
        this.editorService = editorService;
        this.textModelService = textModelService;
        this.uriService = uriService;
        this.logService = logService;
        this.templateId = InstructionRenderer_1.TEMPLATE_ID;
        this._topStackFrameColor = themeService.getColorTheme().getColor(topStackFrameColor);
        this._focusedStackFrameColor = themeService.getColorTheme().getColor(focusedStackFrameColor);
        this._register(themeService.onDidColorThemeChange(e => {
            this._topStackFrameColor = e.getColor(topStackFrameColor);
            this._focusedStackFrameColor = e.getColor(focusedStackFrameColor);
        }));
    }
    renderTemplate(container) {
        const sourcecode = append(container, $('.sourcecode'));
        const instruction = append(container, $('.instruction'));
        this.applyFontInfo(sourcecode);
        this.applyFontInfo(instruction);
        const currentElement = { element: undefined };
        const cellDisposable = [];
        const disposables = [
            this._disassemblyView.onDidChangeStackFrame(() => this.rerenderBackground(instruction, sourcecode, currentElement.element)),
            addStandardDisposableListener(sourcecode, 'dblclick', () => this.openSourceCode(currentElement.element?.instruction)),
        ];
        return { currentElement, instruction, sourcecode, cellDisposable, disposables };
    }
    renderElement(element, index, templateData, height) {
        this.renderElementInner(element, index, templateData, height);
    }
    async renderElementInner(element, index, templateData, height) {
        templateData.currentElement.element = element;
        const instruction = element.instruction;
        templateData.sourcecode.innerText = '';
        const sb = new StringBuilder(1000);
        if (this._disassemblyView.isSourceCodeRender && element.showSourceLocation && instruction.location?.path && instruction.line !== undefined) {
            const sourceURI = this.getUriFromSource(instruction);
            if (sourceURI) {
                let textModel = undefined;
                const sourceSB = new StringBuilder(10000);
                const ref = await this.textModelService.createModelReference(sourceURI);
                if (templateData.currentElement.element !== element) {
                    return; // avoid a race, #192831
                }
                textModel = ref.object.textEditorModel;
                templateData.cellDisposable.push(ref);
                // templateData could have moved on during async.  Double check if it is still the same source.
                if (textModel && templateData.currentElement.element === element) {
                    let lineNumber = instruction.line;
                    while (lineNumber && lineNumber >= 1 && lineNumber <= textModel.getLineCount()) {
                        const lineContent = textModel.getLineContent(lineNumber);
                        sourceSB.appendString(`  ${lineNumber}: `);
                        sourceSB.appendString(lineContent + '\n');
                        if (instruction.endLine && lineNumber < instruction.endLine) {
                            lineNumber++;
                            continue;
                        }
                        break;
                    }
                    templateData.sourcecode.innerText = sourceSB.build();
                }
            }
        }
        let spacesToAppend = 10;
        if (instruction.address !== '-1') {
            sb.appendString(instruction.address);
            if (instruction.address.length < InstructionRenderer_1.INSTRUCTION_ADDR_MIN_LENGTH) {
                spacesToAppend = InstructionRenderer_1.INSTRUCTION_ADDR_MIN_LENGTH - instruction.address.length;
            }
            for (let i = 0; i < spacesToAppend; i++) {
                sb.appendString(' ');
            }
        }
        if (instruction.instructionBytes) {
            sb.appendString(instruction.instructionBytes);
            spacesToAppend = 10;
            if (instruction.instructionBytes.length < InstructionRenderer_1.INSTRUCTION_BYTES_MIN_LENGTH) {
                spacesToAppend = InstructionRenderer_1.INSTRUCTION_BYTES_MIN_LENGTH - instruction.instructionBytes.length;
            }
            for (let i = 0; i < spacesToAppend; i++) {
                sb.appendString(' ');
            }
        }
        sb.appendString(instruction.instruction);
        templateData.instruction.innerText = sb.build();
        this.rerenderBackground(templateData.instruction, templateData.sourcecode, element);
    }
    disposeElement(element, index, templateData, height) {
        dispose(templateData.cellDisposable);
        templateData.cellDisposable = [];
    }
    disposeTemplate(templateData) {
        dispose(templateData.disposables);
        templateData.disposables = [];
    }
    rerenderBackground(instruction, sourceCode, element) {
        if (element && this._disassemblyView.currentInstructionAddresses.includes(element.address)) {
            instruction.style.background = this._topStackFrameColor?.toString() || 'transparent';
        }
        else if (element?.address === this._disassemblyView.focusedInstructionAddress) {
            instruction.style.background = this._focusedStackFrameColor?.toString() || 'transparent';
        }
        else {
            instruction.style.background = 'transparent';
        }
    }
    openSourceCode(instruction) {
        if (instruction) {
            const sourceURI = this.getUriFromSource(instruction);
            const selection = instruction.endLine ? {
                startLineNumber: instruction.line,
                endLineNumber: instruction.endLine,
                startColumn: instruction.column || 1,
                endColumn: instruction.endColumn || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
            } : {
                startLineNumber: instruction.line,
                endLineNumber: instruction.line,
                startColumn: instruction.column || 1,
                endColumn: instruction.endColumn || 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
            };
            this.editorService.openEditor({
                resource: sourceURI,
                description: localize('editorOpenedFromDisassemblyDescription', "from disassembly"),
                options: {
                    preserveFocus: false,
                    selection: selection,
                    revealIfOpened: true,
                    selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */,
                    pinned: false,
                }
            });
        }
    }
    getUriFromSource(instruction) {
        // Try to resolve path before consulting the debugSession.
        const path = instruction.location.path;
        if (path && isUri(path)) { // path looks like a uri
            return this.uriService.asCanonicalUri(URI.parse(path));
        }
        // assume a filesystem path
        if (path && isAbsolute(path)) {
            return this.uriService.asCanonicalUri(URI.file(path));
        }
        return getUriFromSource(instruction.location, instruction.location.path, this._disassemblyView.debugSession.getId(), this.uriService, this.logService);
    }
    applyFontInfo(element) {
        applyFontInfo(element, this._disassemblyView.fontInfo);
        element.style.whiteSpace = 'pre';
    }
};
InstructionRenderer = InstructionRenderer_1 = __decorate([
    __param(1, IThemeService),
    __param(2, IEditorService),
    __param(3, ITextModelService),
    __param(4, IUriIdentityService),
    __param(5, ILogService),
    __metadata("design:paramtypes", [DisassemblyView, Object, Object, Object, Object, Object])
], InstructionRenderer);
class AccessibilityProvider {
    getWidgetAriaLabel() {
        return localize('disassemblyView', "Disassembly View");
    }
    getAriaLabel(element) {
        let label = '';
        const instruction = element.instruction;
        if (instruction.address !== '-1') {
            label += `${localize('instructionAddress', "Address")}: ${instruction.address}`;
        }
        if (instruction.instructionBytes) {
            label += `, ${localize('instructionBytes', "Bytes")}: ${instruction.instructionBytes}`;
        }
        label += `, ${localize(`instructionText`, "Instruction")}: ${instruction.instruction}`;
        return label;
    }
}
let DisassemblyViewContribution = class DisassemblyViewContribution {
    constructor(editorService, debugService, contextKeyService) {
        contextKeyService.bufferChangeEvents(() => {
            this._languageSupportsDisassembleRequest = CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST.bindTo(contextKeyService);
        });
        const onDidActiveEditorChangeListener = () => {
            if (this._onDidChangeModelLanguage) {
                this._onDidChangeModelLanguage.dispose();
                this._onDidChangeModelLanguage = undefined;
            }
            const activeTextEditorControl = editorService.activeTextEditorControl;
            if (isCodeEditor(activeTextEditorControl)) {
                const language = activeTextEditorControl.getModel()?.getLanguageId();
                // TODO: instead of using idDebuggerInterestedInLanguage, have a specific ext point for languages
                // support disassembly
                this._languageSupportsDisassembleRequest?.set(!!language && debugService.getAdapterManager().someDebuggerInterestedInLanguage(language));
                this._onDidChangeModelLanguage = activeTextEditorControl.onDidChangeModelLanguage(e => {
                    this._languageSupportsDisassembleRequest?.set(debugService.getAdapterManager().someDebuggerInterestedInLanguage(e.newLanguage));
                });
            }
            else {
                this._languageSupportsDisassembleRequest?.set(false);
            }
        };
        onDidActiveEditorChangeListener();
        this._onDidActiveEditorChangeListener = editorService.onDidActiveEditorChange(onDidActiveEditorChangeListener);
    }
    dispose() {
        this._onDidActiveEditorChangeListener.dispose();
        this._onDidChangeModelLanguage?.dispose();
    }
};
DisassemblyViewContribution = __decorate([
    __param(0, IEditorService),
    __param(1, IDebugService),
    __param(2, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object])
], DisassemblyViewContribution);
export { DisassemblyViewContribution };
