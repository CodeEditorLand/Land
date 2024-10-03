import { Disposable } from '../../base/common/lifecycle.js';
export class ViewEventHandler extends Disposable {
    constructor() {
        super();
        this._shouldRender = true;
    }
    shouldRender() {
        return this._shouldRender;
    }
    forceShouldRender() {
        this._shouldRender = true;
    }
    setShouldRender() {
        this._shouldRender = true;
    }
    onDidRender() {
        this._shouldRender = false;
    }
    onCompositionStart(e) {
        return false;
    }
    onCompositionEnd(e) {
        return false;
    }
    onConfigurationChanged(e) {
        return false;
    }
    onCursorStateChanged(e) {
        return false;
    }
    onDecorationsChanged(e) {
        return false;
    }
    onFlushed(e) {
        return false;
    }
    onFocusChanged(e) {
        return false;
    }
    onLanguageConfigurationChanged(e) {
        return false;
    }
    onLineMappingChanged(e) {
        return false;
    }
    onLinesChanged(e) {
        return false;
    }
    onLinesDeleted(e) {
        return false;
    }
    onLinesInserted(e) {
        return false;
    }
    onRevealRangeRequest(e) {
        return false;
    }
    onScrollChanged(e) {
        return false;
    }
    onThemeChanged(e) {
        return false;
    }
    onTokensChanged(e) {
        return false;
    }
    onTokensColorsChanged(e) {
        return false;
    }
    onZonesChanged(e) {
        return false;
    }
    handleEvents(events) {
        let shouldRender = false;
        for (let i = 0, len = events.length; i < len; i++) {
            const e = events[i];
            switch (e.type) {
                case 0:
                    if (this.onCompositionStart(e)) {
                        shouldRender = true;
                    }
                    break;
                case 1:
                    if (this.onCompositionEnd(e)) {
                        shouldRender = true;
                    }
                    break;
                case 2:
                    if (this.onConfigurationChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 3:
                    if (this.onCursorStateChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 4:
                    if (this.onDecorationsChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 5:
                    if (this.onFlushed(e)) {
                        shouldRender = true;
                    }
                    break;
                case 6:
                    if (this.onFocusChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 7:
                    if (this.onLanguageConfigurationChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 8:
                    if (this.onLineMappingChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 9:
                    if (this.onLinesChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 10:
                    if (this.onLinesDeleted(e)) {
                        shouldRender = true;
                    }
                    break;
                case 11:
                    if (this.onLinesInserted(e)) {
                        shouldRender = true;
                    }
                    break;
                case 12:
                    if (this.onRevealRangeRequest(e)) {
                        shouldRender = true;
                    }
                    break;
                case 13:
                    if (this.onScrollChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 15:
                    if (this.onTokensChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 14:
                    if (this.onThemeChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 16:
                    if (this.onTokensColorsChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case 17:
                    if (this.onZonesChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                default:
                    console.info('View received unknown event: ');
                    console.info(e);
            }
        }
        if (shouldRender) {
            this._shouldRender = true;
        }
    }
}
