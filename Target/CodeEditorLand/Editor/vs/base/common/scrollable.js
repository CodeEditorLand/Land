import { Emitter } from './event.js';
import { Disposable } from './lifecycle.js';
export class ScrollState {
    constructor(_forceIntegerValues, width, scrollWidth, scrollLeft, height, scrollHeight, scrollTop) {
        this._forceIntegerValues = _forceIntegerValues;
        this._scrollStateBrand = undefined;
        if (this._forceIntegerValues) {
            width = width | 0;
            scrollWidth = scrollWidth | 0;
            scrollLeft = scrollLeft | 0;
            height = height | 0;
            scrollHeight = scrollHeight | 0;
            scrollTop = scrollTop | 0;
        }
        this.rawScrollLeft = scrollLeft;
        this.rawScrollTop = scrollTop;
        if (width < 0) {
            width = 0;
        }
        if (scrollLeft + width > scrollWidth) {
            scrollLeft = scrollWidth - width;
        }
        if (scrollLeft < 0) {
            scrollLeft = 0;
        }
        if (height < 0) {
            height = 0;
        }
        if (scrollTop + height > scrollHeight) {
            scrollTop = scrollHeight - height;
        }
        if (scrollTop < 0) {
            scrollTop = 0;
        }
        this.width = width;
        this.scrollWidth = scrollWidth;
        this.scrollLeft = scrollLeft;
        this.height = height;
        this.scrollHeight = scrollHeight;
        this.scrollTop = scrollTop;
    }
    equals(other) {
        return (this.rawScrollLeft === other.rawScrollLeft
            && this.rawScrollTop === other.rawScrollTop
            && this.width === other.width
            && this.scrollWidth === other.scrollWidth
            && this.scrollLeft === other.scrollLeft
            && this.height === other.height
            && this.scrollHeight === other.scrollHeight
            && this.scrollTop === other.scrollTop);
    }
    withScrollDimensions(update, useRawScrollPositions) {
        return new ScrollState(this._forceIntegerValues, (typeof update.width !== 'undefined' ? update.width : this.width), (typeof update.scrollWidth !== 'undefined' ? update.scrollWidth : this.scrollWidth), useRawScrollPositions ? this.rawScrollLeft : this.scrollLeft, (typeof update.height !== 'undefined' ? update.height : this.height), (typeof update.scrollHeight !== 'undefined' ? update.scrollHeight : this.scrollHeight), useRawScrollPositions ? this.rawScrollTop : this.scrollTop);
    }
    withScrollPosition(update) {
        return new ScrollState(this._forceIntegerValues, this.width, this.scrollWidth, (typeof update.scrollLeft !== 'undefined' ? update.scrollLeft : this.rawScrollLeft), this.height, this.scrollHeight, (typeof update.scrollTop !== 'undefined' ? update.scrollTop : this.rawScrollTop));
    }
    createScrollEvent(previous, inSmoothScrolling) {
        const widthChanged = (this.width !== previous.width);
        const scrollWidthChanged = (this.scrollWidth !== previous.scrollWidth);
        const scrollLeftChanged = (this.scrollLeft !== previous.scrollLeft);
        const heightChanged = (this.height !== previous.height);
        const scrollHeightChanged = (this.scrollHeight !== previous.scrollHeight);
        const scrollTopChanged = (this.scrollTop !== previous.scrollTop);
        return {
            inSmoothScrolling: inSmoothScrolling,
            oldWidth: previous.width,
            oldScrollWidth: previous.scrollWidth,
            oldScrollLeft: previous.scrollLeft,
            width: this.width,
            scrollWidth: this.scrollWidth,
            scrollLeft: this.scrollLeft,
            oldHeight: previous.height,
            oldScrollHeight: previous.scrollHeight,
            oldScrollTop: previous.scrollTop,
            height: this.height,
            scrollHeight: this.scrollHeight,
            scrollTop: this.scrollTop,
            widthChanged: widthChanged,
            scrollWidthChanged: scrollWidthChanged,
            scrollLeftChanged: scrollLeftChanged,
            heightChanged: heightChanged,
            scrollHeightChanged: scrollHeightChanged,
            scrollTopChanged: scrollTopChanged,
        };
    }
}
export class Scrollable extends Disposable {
    constructor(options) {
        super();
        this._scrollableBrand = undefined;
        this._onScroll = this._register(new Emitter());
        this.onScroll = this._onScroll.event;
        this._smoothScrollDuration = options.smoothScrollDuration;
        this._scheduleAtNextAnimationFrame = options.scheduleAtNextAnimationFrame;
        this._state = new ScrollState(options.forceIntegerValues, 0, 0, 0, 0, 0, 0);
        this._smoothScrolling = null;
    }
    dispose() {
        if (this._smoothScrolling) {
            this._smoothScrolling.dispose();
            this._smoothScrolling = null;
        }
        super.dispose();
    }
    setSmoothScrollDuration(smoothScrollDuration) {
        this._smoothScrollDuration = smoothScrollDuration;
    }
    validateScrollPosition(scrollPosition) {
        return this._state.withScrollPosition(scrollPosition);
    }
    getScrollDimensions() {
        return this._state;
    }
    setScrollDimensions(dimensions, useRawScrollPositions) {
        const newState = this._state.withScrollDimensions(dimensions, useRawScrollPositions);
        this._setState(newState, Boolean(this._smoothScrolling));
        this._smoothScrolling?.acceptScrollDimensions(this._state);
    }
    getFutureScrollPosition() {
        if (this._smoothScrolling) {
            return this._smoothScrolling.to;
        }
        return this._state;
    }
    getCurrentScrollPosition() {
        return this._state;
    }
    setScrollPositionNow(update) {
        const newState = this._state.withScrollPosition(update);
        if (this._smoothScrolling) {
            this._smoothScrolling.dispose();
            this._smoothScrolling = null;
        }
        this._setState(newState, false);
    }
    setScrollPositionSmooth(update, reuseAnimation) {
        if (this._smoothScrollDuration === 0) {
            return this.setScrollPositionNow(update);
        }
        if (this._smoothScrolling) {
            update = {
                scrollLeft: (typeof update.scrollLeft === 'undefined' ? this._smoothScrolling.to.scrollLeft : update.scrollLeft),
                scrollTop: (typeof update.scrollTop === 'undefined' ? this._smoothScrolling.to.scrollTop : update.scrollTop)
            };
            const validTarget = this._state.withScrollPosition(update);
            if (this._smoothScrolling.to.scrollLeft === validTarget.scrollLeft && this._smoothScrolling.to.scrollTop === validTarget.scrollTop) {
                return;
            }
            let newSmoothScrolling;
            if (reuseAnimation) {
                newSmoothScrolling = new SmoothScrollingOperation(this._smoothScrolling.from, validTarget, this._smoothScrolling.startTime, this._smoothScrolling.duration);
            }
            else {
                newSmoothScrolling = this._smoothScrolling.combine(this._state, validTarget, this._smoothScrollDuration);
            }
            this._smoothScrolling.dispose();
            this._smoothScrolling = newSmoothScrolling;
        }
        else {
            const validTarget = this._state.withScrollPosition(update);
            this._smoothScrolling = SmoothScrollingOperation.start(this._state, validTarget, this._smoothScrollDuration);
        }
        this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(() => {
            if (!this._smoothScrolling) {
                return;
            }
            this._smoothScrolling.animationFrameDisposable = null;
            this._performSmoothScrolling();
        });
    }
    hasPendingScrollAnimation() {
        return Boolean(this._smoothScrolling);
    }
    _performSmoothScrolling() {
        if (!this._smoothScrolling) {
            return;
        }
        const update = this._smoothScrolling.tick();
        const newState = this._state.withScrollPosition(update);
        this._setState(newState, true);
        if (!this._smoothScrolling) {
            return;
        }
        if (update.isDone) {
            this._smoothScrolling.dispose();
            this._smoothScrolling = null;
            return;
        }
        this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame(() => {
            if (!this._smoothScrolling) {
                return;
            }
            this._smoothScrolling.animationFrameDisposable = null;
            this._performSmoothScrolling();
        });
    }
    _setState(newState, inSmoothScrolling) {
        const oldState = this._state;
        if (oldState.equals(newState)) {
            return;
        }
        this._state = newState;
        this._onScroll.fire(this._state.createScrollEvent(oldState, inSmoothScrolling));
    }
}
export class SmoothScrollingUpdate {
    constructor(scrollLeft, scrollTop, isDone) {
        this.scrollLeft = scrollLeft;
        this.scrollTop = scrollTop;
        this.isDone = isDone;
    }
}
function createEaseOutCubic(from, to) {
    const delta = to - from;
    return function (completion) {
        return from + delta * easeOutCubic(completion);
    };
}
function createComposed(a, b, cut) {
    return function (completion) {
        if (completion < cut) {
            return a(completion / cut);
        }
        return b((completion - cut) / (1 - cut));
    };
}
export class SmoothScrollingOperation {
    constructor(from, to, startTime, duration) {
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.startTime = startTime;
        this.animationFrameDisposable = null;
        this._initAnimations();
    }
    _initAnimations() {
        this.scrollLeft = this._initAnimation(this.from.scrollLeft, this.to.scrollLeft, this.to.width);
        this.scrollTop = this._initAnimation(this.from.scrollTop, this.to.scrollTop, this.to.height);
    }
    _initAnimation(from, to, viewportSize) {
        const delta = Math.abs(from - to);
        if (delta > 2.5 * viewportSize) {
            let stop1, stop2;
            if (from < to) {
                stop1 = from + 0.75 * viewportSize;
                stop2 = to - 0.75 * viewportSize;
            }
            else {
                stop1 = from - 0.75 * viewportSize;
                stop2 = to + 0.75 * viewportSize;
            }
            return createComposed(createEaseOutCubic(from, stop1), createEaseOutCubic(stop2, to), 0.33);
        }
        return createEaseOutCubic(from, to);
    }
    dispose() {
        if (this.animationFrameDisposable !== null) {
            this.animationFrameDisposable.dispose();
            this.animationFrameDisposable = null;
        }
    }
    acceptScrollDimensions(state) {
        this.to = state.withScrollPosition(this.to);
        this._initAnimations();
    }
    tick() {
        return this._tick(Date.now());
    }
    _tick(now) {
        const completion = (now - this.startTime) / this.duration;
        if (completion < 1) {
            const newScrollLeft = this.scrollLeft(completion);
            const newScrollTop = this.scrollTop(completion);
            return new SmoothScrollingUpdate(newScrollLeft, newScrollTop, false);
        }
        return new SmoothScrollingUpdate(this.to.scrollLeft, this.to.scrollTop, true);
    }
    combine(from, to, duration) {
        return SmoothScrollingOperation.start(from, to, duration);
    }
    static start(from, to, duration) {
        duration = duration + 10;
        const startTime = Date.now() - 10;
        return new SmoothScrollingOperation(from, to, startTime, duration);
    }
}
function easeInCubic(t) {
    return Math.pow(t, 3);
}
function easeOutCubic(t) {
    return 1 - easeInCubic(1 - t);
}
