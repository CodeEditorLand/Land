import { TimeoutTimer } from '../../../common/async.js';
import { Disposable } from '../../../common/lifecycle.js';
export class ScrollbarVisibilityController extends Disposable {
    constructor(visibility, visibleClassName, invisibleClassName) {
        super();
        this._visibility = visibility;
        this._visibleClassName = visibleClassName;
        this._invisibleClassName = invisibleClassName;
        this._domNode = null;
        this._isVisible = false;
        this._isNeeded = false;
        this._rawShouldBeVisible = false;
        this._shouldBeVisible = false;
        this._revealTimer = this._register(new TimeoutTimer());
    }
    setVisibility(visibility) {
        if (this._visibility !== visibility) {
            this._visibility = visibility;
            this._updateShouldBeVisible();
        }
    }
    setShouldBeVisible(rawShouldBeVisible) {
        this._rawShouldBeVisible = rawShouldBeVisible;
        this._updateShouldBeVisible();
    }
    _applyVisibilitySetting() {
        if (this._visibility === 2) {
            return false;
        }
        if (this._visibility === 3) {
            return true;
        }
        return this._rawShouldBeVisible;
    }
    _updateShouldBeVisible() {
        const shouldBeVisible = this._applyVisibilitySetting();
        if (this._shouldBeVisible !== shouldBeVisible) {
            this._shouldBeVisible = shouldBeVisible;
            this.ensureVisibility();
        }
    }
    setIsNeeded(isNeeded) {
        if (this._isNeeded !== isNeeded) {
            this._isNeeded = isNeeded;
            this.ensureVisibility();
        }
    }
    setDomNode(domNode) {
        this._domNode = domNode;
        this._domNode.setClassName(this._invisibleClassName);
        this.setShouldBeVisible(false);
    }
    ensureVisibility() {
        if (!this._isNeeded) {
            this._hide(false);
            return;
        }
        if (this._shouldBeVisible) {
            this._reveal();
        }
        else {
            this._hide(true);
        }
    }
    _reveal() {
        if (this._isVisible) {
            return;
        }
        this._isVisible = true;
        this._revealTimer.setIfNotSet(() => {
            this._domNode?.setClassName(this._visibleClassName);
        }, 0);
    }
    _hide(withFadeAway) {
        this._revealTimer.cancel();
        if (!this._isVisible) {
            return;
        }
        this._isVisible = false;
        this._domNode?.setClassName(this._invisibleClassName + (withFadeAway ? ' fade' : ''));
    }
}
