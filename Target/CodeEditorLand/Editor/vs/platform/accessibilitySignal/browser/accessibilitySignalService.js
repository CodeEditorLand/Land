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
import { CachedFunction } from '../../../base/common/cache.js';
import { getStructuralKey } from '../../../base/common/equals.js';
import { Disposable, toDisposable } from '../../../base/common/lifecycle.js';
import { FileAccess } from '../../../base/common/network.js';
import { derived, observableFromEvent, ValueWithChangeEventFromObservable } from '../../../base/common/observable.js';
import { localize } from '../../../nls.js';
import { IAccessibilityService } from '../../accessibility/common/accessibility.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { observableConfigValue } from '../../observable/common/platformObservableUtils.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export const IAccessibilitySignalService = createDecorator('accessibilitySignalService');
export const AcknowledgeDocCommentsToken = Symbol('AcknowledgeDocCommentsToken');
let AccessibilitySignalService = class AccessibilitySignalService extends Disposable {
    constructor(configurationService, accessibilityService, telemetryService) {
        super();
        this.configurationService = configurationService;
        this.accessibilityService = accessibilityService;
        this.telemetryService = telemetryService;
        this.sounds = new Map();
        this.screenReaderAttached = observableFromEvent(this, this.accessibilityService.onDidChangeScreenReaderOptimized, () => this.accessibilityService.isScreenReaderOptimized());
        this.sentTelemetry = new Set();
        this.playingSounds = new Set();
        this._signalConfigValue = new CachedFunction((signal) => observableConfigValue(signal.settingsKey, { sound: 'off', announcement: 'off' }, this.configurationService));
        this._signalEnabledState = new CachedFunction({ getCacheKey: getStructuralKey }, (arg) => {
            return derived(reader => {
                const setting = this._signalConfigValue.get(arg.signal).read(reader);
                if (arg.modality === 'sound' || arg.modality === undefined) {
                    if (checkEnabledState(setting.sound, () => this.screenReaderAttached.read(reader), arg.userGesture)) {
                        return true;
                    }
                }
                if (arg.modality === 'announcement' || arg.modality === undefined) {
                    if (checkEnabledState(setting.announcement, () => this.screenReaderAttached.read(reader), arg.userGesture)) {
                        return true;
                    }
                }
                return false;
            }).recomputeInitiallyAndOnChange(this._store);
        });
    }
    getEnabledState(signal, userGesture, modality) {
        return new ValueWithChangeEventFromObservable(this._signalEnabledState.get({ signal, userGesture, modality }));
    }
    async playSignal(signal, options = {}) {
        const shouldPlayAnnouncement = options.modality === 'announcement' || options.modality === undefined;
        const announcementMessage = signal.announcementMessage;
        if (shouldPlayAnnouncement && this.isAnnouncementEnabled(signal, options.userGesture) && announcementMessage) {
            this.accessibilityService.status(announcementMessage);
        }
        const shouldPlaySound = options.modality === 'sound' || options.modality === undefined;
        if (shouldPlaySound && this.isSoundEnabled(signal, options.userGesture)) {
            this.sendSignalTelemetry(signal, options.source);
            await this.playSound(signal.sound.getSound(), options.allowManyInParallel);
        }
    }
    async playSignals(signals) {
        for (const signal of signals) {
            this.sendSignalTelemetry('signal' in signal ? signal.signal : signal, 'source' in signal ? signal.source : undefined);
        }
        const signalArray = signals.map(s => 'signal' in s ? s.signal : s);
        const announcements = signalArray.filter(signal => this.isAnnouncementEnabled(signal)).map(s => s.announcementMessage);
        if (announcements.length) {
            this.accessibilityService.status(announcements.join(', '));
        }
        const sounds = new Set(signalArray.filter(signal => this.isSoundEnabled(signal)).map(signal => signal.sound.getSound()));
        await Promise.all(Array.from(sounds).map(sound => this.playSound(sound, true)));
    }
    sendSignalTelemetry(signal, source) {
        const isScreenReaderOptimized = this.accessibilityService.isScreenReaderOptimized();
        const key = signal.name + (source ? `::${source}` : '') + (isScreenReaderOptimized ? '{screenReaderOptimized}' : '');
        if (this.sentTelemetry.has(key) || this.getVolumeInPercent() === 0) {
            return;
        }
        this.sentTelemetry.add(key);
        this.telemetryService.publicLog2('signal.played', {
            signal: signal.name,
            source: source ?? '',
            isScreenReaderOptimized,
        });
    }
    getVolumeInPercent() {
        const volume = this.configurationService.getValue('accessibility.signalOptions.volume');
        if (typeof volume !== 'number') {
            return 50;
        }
        return Math.max(Math.min(volume, 100), 0);
    }
    async playSound(sound, allowManyInParallel = false) {
        if (!allowManyInParallel && this.playingSounds.has(sound)) {
            return;
        }
        this.playingSounds.add(sound);
        const url = FileAccess.asBrowserUri(`vs/platform/accessibilitySignal/browser/media/${sound.fileName}`).toString(true);
        try {
            const sound = this.sounds.get(url);
            if (sound) {
                sound.volume = this.getVolumeInPercent() / 100;
                sound.currentTime = 0;
                await sound.play();
            }
            else {
                const playedSound = await playAudio(url, this.getVolumeInPercent() / 100);
                this.sounds.set(url, playedSound);
            }
        }
        catch (e) {
            if (!e.message.includes('play() can only be initiated by a user gesture')) {
                console.error('Error while playing sound', e);
            }
        }
        finally {
            this.playingSounds.delete(sound);
        }
    }
    playSignalLoop(signal, milliseconds) {
        let playing = true;
        const playSound = () => {
            if (playing) {
                this.playSignal(signal, { allowManyInParallel: true }).finally(() => {
                    setTimeout(() => {
                        if (playing) {
                            playSound();
                        }
                    }, milliseconds);
                });
            }
        };
        playSound();
        return toDisposable(() => playing = false);
    }
    isAnnouncementEnabled(signal, userGesture) {
        if (!signal.announcementMessage) {
            return false;
        }
        return this._signalEnabledState.get({ signal, userGesture: !!userGesture, modality: 'announcement' }).get();
    }
    isSoundEnabled(signal, userGesture) {
        return this._signalEnabledState.get({ signal, userGesture: !!userGesture, modality: 'sound' }).get();
    }
    onSoundEnabledChanged(signal) {
        return this.getEnabledState(signal, false).onDidChange;
    }
    getDelayMs(signal, modality, mode) {
        if (!this.configurationService.getValue('accessibility.signalOptions.debouncePositionChanges')) {
            return 0;
        }
        let value;
        if (signal.name === AccessibilitySignal.errorAtPosition.name && mode === 'positional') {
            value = this.configurationService.getValue('accessibility.signalOptions.experimental.delays.errorAtPosition');
        }
        else if (signal.name === AccessibilitySignal.warningAtPosition.name && mode === 'positional') {
            value = this.configurationService.getValue('accessibility.signalOptions.experimental.delays.warningAtPosition');
        }
        else {
            value = this.configurationService.getValue('accessibility.signalOptions.experimental.delays.general');
        }
        return modality === 'sound' ? value.sound : value.announcement;
    }
};
AccessibilitySignalService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IAccessibilityService),
    __param(2, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object])
], AccessibilitySignalService);
export { AccessibilitySignalService };
function checkEnabledState(state, getScreenReaderAttached, isTriggeredByUserGesture) {
    return state === 'on' || state === 'always' || (state === 'auto' && getScreenReaderAttached()) || state === 'userGesture' && isTriggeredByUserGesture;
}
function playAudio(url, volume) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audio.volume = volume;
        audio.addEventListener('ended', () => {
            resolve(audio);
        });
        audio.addEventListener('error', (e) => {
            reject(e.error);
        });
        audio.play().catch(e => {
            reject(e);
        });
    });
}
export class Sound {
    static register(options) {
        const sound = new Sound(options.fileName);
        return sound;
    }
    static { this.error = Sound.register({ fileName: 'error.mp3' }); }
    static { this.warning = Sound.register({ fileName: 'warning.mp3' }); }
    static { this.success = Sound.register({ fileName: 'success.mp3' }); }
    static { this.foldedArea = Sound.register({ fileName: 'foldedAreas.mp3' }); }
    static { this.break = Sound.register({ fileName: 'break.mp3' }); }
    static { this.quickFixes = Sound.register({ fileName: 'quickFixes.mp3' }); }
    static { this.taskCompleted = Sound.register({ fileName: 'taskCompleted.mp3' }); }
    static { this.taskFailed = Sound.register({ fileName: 'taskFailed.mp3' }); }
    static { this.terminalBell = Sound.register({ fileName: 'terminalBell.mp3' }); }
    static { this.diffLineInserted = Sound.register({ fileName: 'diffLineInserted.mp3' }); }
    static { this.diffLineDeleted = Sound.register({ fileName: 'diffLineDeleted.mp3' }); }
    static { this.diffLineModified = Sound.register({ fileName: 'diffLineModified.mp3' }); }
    static { this.chatRequestSent = Sound.register({ fileName: 'chatRequestSent.mp3' }); }
    static { this.chatResponseReceived1 = Sound.register({ fileName: 'chatResponseReceived1.mp3' }); }
    static { this.chatResponseReceived2 = Sound.register({ fileName: 'chatResponseReceived2.mp3' }); }
    static { this.chatResponseReceived3 = Sound.register({ fileName: 'chatResponseReceived3.mp3' }); }
    static { this.chatResponseReceived4 = Sound.register({ fileName: 'chatResponseReceived4.mp3' }); }
    static { this.clear = Sound.register({ fileName: 'clear.mp3' }); }
    static { this.save = Sound.register({ fileName: 'save.mp3' }); }
    static { this.format = Sound.register({ fileName: 'format.mp3' }); }
    static { this.voiceRecordingStarted = Sound.register({ fileName: 'voiceRecordingStarted.mp3' }); }
    static { this.voiceRecordingStopped = Sound.register({ fileName: 'voiceRecordingStopped.mp3' }); }
    static { this.progress = Sound.register({ fileName: 'progress.mp3' }); }
    constructor(fileName) {
        this.fileName = fileName;
    }
}
export class SoundSource {
    constructor(randomOneOf) {
        this.randomOneOf = randomOneOf;
    }
    getSound(deterministic = false) {
        if (deterministic || this.randomOneOf.length === 1) {
            return this.randomOneOf[0];
        }
        else {
            const index = Math.floor(Math.random() * this.randomOneOf.length);
            return this.randomOneOf[index];
        }
    }
}
export class AccessibilitySignal {
    constructor(sound, name, legacySoundSettingsKey, settingsKey, legacyAnnouncementSettingsKey, announcementMessage) {
        this.sound = sound;
        this.name = name;
        this.legacySoundSettingsKey = legacySoundSettingsKey;
        this.settingsKey = settingsKey;
        this.legacyAnnouncementSettingsKey = legacyAnnouncementSettingsKey;
        this.announcementMessage = announcementMessage;
    }
    static { this._signals = new Set(); }
    static register(options) {
        const soundSource = new SoundSource('randomOneOf' in options.sound ? options.sound.randomOneOf : [options.sound]);
        const signal = new AccessibilitySignal(soundSource, options.name, options.legacySoundSettingsKey, options.settingsKey, options.legacyAnnouncementSettingsKey, options.announcementMessage);
        AccessibilitySignal._signals.add(signal);
        return signal;
    }
    static get allAccessibilitySignals() {
        return [...this._signals];
    }
    static { this.errorAtPosition = AccessibilitySignal.register({
        name: localize('accessibilitySignals.positionHasError.name', 'Error at Position'),
        sound: Sound.error,
        announcementMessage: localize('accessibility.signals.positionHasError', 'Error'),
        settingsKey: 'accessibility.signals.positionHasError',
        delaySettingsKey: 'accessibility.signalOptions.delays.errorAtPosition'
    }); }
    static { this.warningAtPosition = AccessibilitySignal.register({
        name: localize('accessibilitySignals.positionHasWarning.name', 'Warning at Position'),
        sound: Sound.warning,
        announcementMessage: localize('accessibility.signals.positionHasWarning', 'Warning'),
        settingsKey: 'accessibility.signals.positionHasWarning',
        delaySettingsKey: 'accessibility.signalOptions.delays.warningAtPosition'
    }); }
    static { this.errorOnLine = AccessibilitySignal.register({
        name: localize('accessibilitySignals.lineHasError.name', 'Error on Line'),
        sound: Sound.error,
        legacySoundSettingsKey: 'audioCues.lineHasError',
        legacyAnnouncementSettingsKey: 'accessibility.alert.error',
        announcementMessage: localize('accessibility.signals.lineHasError', 'Error on Line'),
        settingsKey: 'accessibility.signals.lineHasError',
    }); }
    static { this.warningOnLine = AccessibilitySignal.register({
        name: localize('accessibilitySignals.lineHasWarning.name', 'Warning on Line'),
        sound: Sound.warning,
        legacySoundSettingsKey: 'audioCues.lineHasWarning',
        legacyAnnouncementSettingsKey: 'accessibility.alert.warning',
        announcementMessage: localize('accessibility.signals.lineHasWarning', 'Warning on Line'),
        settingsKey: 'accessibility.signals.lineHasWarning',
    }); }
    static { this.foldedArea = AccessibilitySignal.register({
        name: localize('accessibilitySignals.lineHasFoldedArea.name', 'Folded Area on Line'),
        sound: Sound.foldedArea,
        legacySoundSettingsKey: 'audioCues.lineHasFoldedArea',
        legacyAnnouncementSettingsKey: 'accessibility.alert.foldedArea',
        announcementMessage: localize('accessibility.signals.lineHasFoldedArea', 'Folded'),
        settingsKey: 'accessibility.signals.lineHasFoldedArea',
    }); }
    static { this.break = AccessibilitySignal.register({
        name: localize('accessibilitySignals.lineHasBreakpoint.name', 'Breakpoint on Line'),
        sound: Sound.break,
        legacySoundSettingsKey: 'audioCues.lineHasBreakpoint',
        legacyAnnouncementSettingsKey: 'accessibility.alert.breakpoint',
        announcementMessage: localize('accessibility.signals.lineHasBreakpoint', 'Breakpoint'),
        settingsKey: 'accessibility.signals.lineHasBreakpoint',
    }); }
    static { this.inlineSuggestion = AccessibilitySignal.register({
        name: localize('accessibilitySignals.lineHasInlineSuggestion.name', 'Inline Suggestion on Line'),
        sound: Sound.quickFixes,
        legacySoundSettingsKey: 'audioCues.lineHasInlineSuggestion',
        settingsKey: 'accessibility.signals.lineHasInlineSuggestion',
    }); }
    static { this.terminalQuickFix = AccessibilitySignal.register({
        name: localize('accessibilitySignals.terminalQuickFix.name', 'Terminal Quick Fix'),
        sound: Sound.quickFixes,
        legacySoundSettingsKey: 'audioCues.terminalQuickFix',
        legacyAnnouncementSettingsKey: 'accessibility.alert.terminalQuickFix',
        announcementMessage: localize('accessibility.signals.terminalQuickFix', 'Quick Fix'),
        settingsKey: 'accessibility.signals.terminalQuickFix',
    }); }
    static { this.onDebugBreak = AccessibilitySignal.register({
        name: localize('accessibilitySignals.onDebugBreak.name', 'Debugger Stopped on Breakpoint'),
        sound: Sound.break,
        legacySoundSettingsKey: 'audioCues.onDebugBreak',
        legacyAnnouncementSettingsKey: 'accessibility.alert.onDebugBreak',
        announcementMessage: localize('accessibility.signals.onDebugBreak', 'Breakpoint'),
        settingsKey: 'accessibility.signals.onDebugBreak',
    }); }
    static { this.noInlayHints = AccessibilitySignal.register({
        name: localize('accessibilitySignals.noInlayHints', 'No Inlay Hints on Line'),
        sound: Sound.error,
        legacySoundSettingsKey: 'audioCues.noInlayHints',
        legacyAnnouncementSettingsKey: 'accessibility.alert.noInlayHints',
        announcementMessage: localize('accessibility.signals.noInlayHints', 'No Inlay Hints'),
        settingsKey: 'accessibility.signals.noInlayHints',
    }); }
    static { this.taskCompleted = AccessibilitySignal.register({
        name: localize('accessibilitySignals.taskCompleted', 'Task Completed'),
        sound: Sound.taskCompleted,
        legacySoundSettingsKey: 'audioCues.taskCompleted',
        legacyAnnouncementSettingsKey: 'accessibility.alert.taskCompleted',
        announcementMessage: localize('accessibility.signals.taskCompleted', 'Task Completed'),
        settingsKey: 'accessibility.signals.taskCompleted',
    }); }
    static { this.taskFailed = AccessibilitySignal.register({
        name: localize('accessibilitySignals.taskFailed', 'Task Failed'),
        sound: Sound.taskFailed,
        legacySoundSettingsKey: 'audioCues.taskFailed',
        legacyAnnouncementSettingsKey: 'accessibility.alert.taskFailed',
        announcementMessage: localize('accessibility.signals.taskFailed', 'Task Failed'),
        settingsKey: 'accessibility.signals.taskFailed',
    }); }
    static { this.terminalCommandFailed = AccessibilitySignal.register({
        name: localize('accessibilitySignals.terminalCommandFailed', 'Terminal Command Failed'),
        sound: Sound.error,
        legacySoundSettingsKey: 'audioCues.terminalCommandFailed',
        legacyAnnouncementSettingsKey: 'accessibility.alert.terminalCommandFailed',
        announcementMessage: localize('accessibility.signals.terminalCommandFailed', 'Command Failed'),
        settingsKey: 'accessibility.signals.terminalCommandFailed',
    }); }
    static { this.terminalCommandSucceeded = AccessibilitySignal.register({
        name: localize('accessibilitySignals.terminalCommandSucceeded', 'Terminal Command Succeeded'),
        sound: Sound.success,
        announcementMessage: localize('accessibility.signals.terminalCommandSucceeded', 'Command Succeeded'),
        settingsKey: 'accessibility.signals.terminalCommandSucceeded',
    }); }
    static { this.terminalBell = AccessibilitySignal.register({
        name: localize('accessibilitySignals.terminalBell', 'Terminal Bell'),
        sound: Sound.terminalBell,
        legacySoundSettingsKey: 'audioCues.terminalBell',
        legacyAnnouncementSettingsKey: 'accessibility.alert.terminalBell',
        announcementMessage: localize('accessibility.signals.terminalBell', 'Terminal Bell'),
        settingsKey: 'accessibility.signals.terminalBell',
    }); }
    static { this.notebookCellCompleted = AccessibilitySignal.register({
        name: localize('accessibilitySignals.notebookCellCompleted', 'Notebook Cell Completed'),
        sound: Sound.taskCompleted,
        legacySoundSettingsKey: 'audioCues.notebookCellCompleted',
        legacyAnnouncementSettingsKey: 'accessibility.alert.notebookCellCompleted',
        announcementMessage: localize('accessibility.signals.notebookCellCompleted', 'Notebook Cell Completed'),
        settingsKey: 'accessibility.signals.notebookCellCompleted',
    }); }
    static { this.notebookCellFailed = AccessibilitySignal.register({
        name: localize('accessibilitySignals.notebookCellFailed', 'Notebook Cell Failed'),
        sound: Sound.taskFailed,
        legacySoundSettingsKey: 'audioCues.notebookCellFailed',
        legacyAnnouncementSettingsKey: 'accessibility.alert.notebookCellFailed',
        announcementMessage: localize('accessibility.signals.notebookCellFailed', 'Notebook Cell Failed'),
        settingsKey: 'accessibility.signals.notebookCellFailed',
    }); }
    static { this.diffLineInserted = AccessibilitySignal.register({
        name: localize('accessibilitySignals.diffLineInserted', 'Diff Line Inserted'),
        sound: Sound.diffLineInserted,
        legacySoundSettingsKey: 'audioCues.diffLineInserted',
        settingsKey: 'accessibility.signals.diffLineInserted',
    }); }
    static { this.diffLineDeleted = AccessibilitySignal.register({
        name: localize('accessibilitySignals.diffLineDeleted', 'Diff Line Deleted'),
        sound: Sound.diffLineDeleted,
        legacySoundSettingsKey: 'audioCues.diffLineDeleted',
        settingsKey: 'accessibility.signals.diffLineDeleted',
    }); }
    static { this.diffLineModified = AccessibilitySignal.register({
        name: localize('accessibilitySignals.diffLineModified', 'Diff Line Modified'),
        sound: Sound.diffLineModified,
        legacySoundSettingsKey: 'audioCues.diffLineModified',
        settingsKey: 'accessibility.signals.diffLineModified',
    }); }
    static { this.chatRequestSent = AccessibilitySignal.register({
        name: localize('accessibilitySignals.chatRequestSent', 'Chat Request Sent'),
        sound: Sound.chatRequestSent,
        legacySoundSettingsKey: 'audioCues.chatRequestSent',
        legacyAnnouncementSettingsKey: 'accessibility.alert.chatRequestSent',
        announcementMessage: localize('accessibility.signals.chatRequestSent', 'Chat Request Sent'),
        settingsKey: 'accessibility.signals.chatRequestSent',
    }); }
    static { this.chatResponseReceived = AccessibilitySignal.register({
        name: localize('accessibilitySignals.chatResponseReceived', 'Chat Response Received'),
        legacySoundSettingsKey: 'audioCues.chatResponseReceived',
        sound: {
            randomOneOf: [
                Sound.chatResponseReceived1,
                Sound.chatResponseReceived2,
                Sound.chatResponseReceived3,
                Sound.chatResponseReceived4
            ]
        },
        settingsKey: 'accessibility.signals.chatResponseReceived'
    }); }
    static { this.progress = AccessibilitySignal.register({
        name: localize('accessibilitySignals.progress', 'Progress'),
        sound: Sound.progress,
        legacySoundSettingsKey: 'audioCues.chatResponsePending',
        legacyAnnouncementSettingsKey: 'accessibility.alert.progress',
        announcementMessage: localize('accessibility.signals.progress', 'Progress'),
        settingsKey: 'accessibility.signals.progress'
    }); }
    static { this.clear = AccessibilitySignal.register({
        name: localize('accessibilitySignals.clear', 'Clear'),
        sound: Sound.clear,
        legacySoundSettingsKey: 'audioCues.clear',
        legacyAnnouncementSettingsKey: 'accessibility.alert.clear',
        announcementMessage: localize('accessibility.signals.clear', 'Clear'),
        settingsKey: 'accessibility.signals.clear'
    }); }
    static { this.save = AccessibilitySignal.register({
        name: localize('accessibilitySignals.save', 'Save'),
        sound: Sound.save,
        legacySoundSettingsKey: 'audioCues.save',
        legacyAnnouncementSettingsKey: 'accessibility.alert.save',
        announcementMessage: localize('accessibility.signals.save', 'Save'),
        settingsKey: 'accessibility.signals.save'
    }); }
    static { this.format = AccessibilitySignal.register({
        name: localize('accessibilitySignals.format', 'Format'),
        sound: Sound.format,
        legacySoundSettingsKey: 'audioCues.format',
        legacyAnnouncementSettingsKey: 'accessibility.alert.format',
        announcementMessage: localize('accessibility.signals.format', 'Format'),
        settingsKey: 'accessibility.signals.format'
    }); }
    static { this.voiceRecordingStarted = AccessibilitySignal.register({
        name: localize('accessibilitySignals.voiceRecordingStarted', 'Voice Recording Started'),
        sound: Sound.voiceRecordingStarted,
        legacySoundSettingsKey: 'audioCues.voiceRecordingStarted',
        settingsKey: 'accessibility.signals.voiceRecordingStarted'
    }); }
    static { this.voiceRecordingStopped = AccessibilitySignal.register({
        name: localize('accessibilitySignals.voiceRecordingStopped', 'Voice Recording Stopped'),
        sound: Sound.voiceRecordingStopped,
        legacySoundSettingsKey: 'audioCues.voiceRecordingStopped',
        settingsKey: 'accessibility.signals.voiceRecordingStopped'
    }); }
}
